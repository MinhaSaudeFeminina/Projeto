<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('stores the rich text body sent by the editor', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $body = '<h2>Sinais de alerta</h2><p>Procure a <strong>UBS</strong>.</p><ul><li>Febre</li></ul>';

    $response = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Sinais de alerta no ciclo',
        'summary' => 'Orientações educativas.',
        'body' => $body,
        'category_id' => $category->id,
    ]);

    $response->assertCreated();

    $this->assertDatabaseHas('educational_contents', [
        'id' => $response->json('data.id'),
        'body' => $body,
    ]);
});

it('strips scripts from the body before persisting a draft', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $response = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Conteúdo com script',
        'summary' => 'Orientações educativas.',
        'body' => '<p onclick="steal()">Orientação</p><script>alert("xss")</script>',
        'category_id' => $category->id,
    ]);

    $response->assertCreated();

    $stored = EducationalContent::findOrFail($response->json('data.id'));

    expect($stored->body)->toBe('<p>Orientação</p>')
        ->and($stored->body)->not->toContain('script')
        ->and($stored->body)->not->toContain('onclick');
});

it('strips scripts from the body when updating a draft', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $created = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Conteúdo educativo',
        'summary' => 'Orientações educativas.',
        'body' => '<p>Versão inicial</p>',
        'category_id' => $category->id,
    ])->assertCreated();

    $contentId = $created->json('data.id');

    $this->actingAs($author, 'sanctum')
        ->patchJson("/api/v1/admin/contents/{$contentId}", [
            'body' => '<p>Versão revisada</p><iframe src="https://evil.test"></iframe>',
        ])
        ->assertOk();

    expect(EducationalContent::findOrFail($contentId)->body)->toBe('<p>Versão revisada</p>');
});

it('rejects a body that becomes empty after sanitization', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $this->actingAs($author, 'sanctum')
        ->postJson('/api/v1/admin/contents', [
            'title' => 'Conteúdo vazio',
            'summary' => 'Orientações educativas.',
            'body' => '<script>alert("xss")</script>',
            'category_id' => $category->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('body');
});

it('keeps html markup out of the search index', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $response = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Sinais de alerta',
        'summary' => 'Orientações educativas.',
        'body' => '<h2>Alerta</h2><p><a href="https://exemplo.test/pagina">Procure a <strong>UBS</strong></a></p>',
        'category_id' => $category->id,
    ])->assertCreated();

    $indexed = EducationalContent::findOrFail($response->json('data.id'))->search_text_normalized;

    // Tag and attribute names would otherwise make every article match them.
    expect($indexed)
        ->not->toContain('h2')
        ->not->toContain('strong')
        ->not->toContain('href')
        ->not->toContain('exemplo test')
        ->toContain('procure a ubs');
});

it('does not glue words from adjacent blocks in the search index', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $response = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Cuidados',
        'summary' => 'Orientações educativas.',
        'body' => '<p>primeiro</p><p>segundo</p>',
        'category_id' => $category->id,
    ])->assertCreated();

    expect(EducationalContent::findOrFail($response->json('data.id'))->search_text_normalized)
        ->toContain('primeiro segundo');
});
