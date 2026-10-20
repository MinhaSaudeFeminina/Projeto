<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows a professor to publish approved content directly but not archive it', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);

    $created = $this->actingAs($reviewer, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Prevenção e autocuidado',
        'summary' => 'Conteúdo educativo aprovado.',
        'body' => 'Informações educativas para promoção da saúde.',
        'category_id' => $category->id,
    ])->assertCreated()->assertJsonPath('data.status', EducationalContent::APPROVED);

    $approvedContent = EducationalContent::findOrFail($created->json('data.id'));
    $publishedContent = EducationalContent::create([
        'title' => 'Saúde e qualidade de vida',
        'slug' => 'saude-e-qualidade-de-vida',
        'summary' => 'Conteúdo educativo publicado.',
        'body' => 'Informações educativas para promoção da saúde.',
        'category_id' => $category->id,
        'status' => EducationalContent::PUBLISHED,
        'author_id' => $reviewer->id,
        'approved_by' => $reviewer->id,
        'approved_at' => now()->subMinute(),
        'published_by' => $reviewer->id,
        'published_at' => now(),
    ]);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$approvedContent->id}/publish")
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::PUBLISHED)
        ->assertJsonPath('data.published_by', $reviewer->id);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$publishedContent->id}/archive")
        ->assertForbidden();

    expect($approvedContent->fresh()->status)->toBe(EducationalContent::PUBLISHED)
        ->and($publishedContent->fresh()->status)->toBe(EducationalContent::PUBLISHED);
});

it('allows a student to publish own content only after an authorized review', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $otherAuthor = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);
    $reviewedContent = EducationalContent::create([
        'title' => 'Saúde íntima e prevenção',
        'slug' => 'saude-intima-e-prevencao',
        'summary' => 'Conteúdo estudantil revisado.',
        'body' => 'Informações educativas revisadas por uma professora.',
        'category_id' => $category->id,
        'status' => EducationalContent::APPROVED,
        'author_id' => $author->id,
        'submitted_by' => $author->id,
        'submitted_at' => now()->subMinutes(2),
        'reviewed_by' => $reviewer->id,
        'reviewed_at' => now()->subMinute(),
        'approved_by' => $reviewer->id,
        'approved_at' => now(),
    ]);
    $draftContent = EducationalContent::create([
        'title' => 'Rascunho sem revisão',
        'slug' => 'rascunho-sem-revisao',
        'summary' => 'Conteúdo ainda não revisado.',
        'body' => 'Informações educativas em elaboração.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);

    $this->actingAs($otherAuthor, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$reviewedContent->id}/publish")
        ->assertForbidden();

    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$reviewedContent->id}/publish")
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::PUBLISHED)
        ->assertJsonPath('data.published_by', $author->id);

    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$draftContent->id}/publish")
        ->assertForbidden();

});

it('blocks publication when approval metadata is missing', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar']);
    $content = EducationalContent::create([
        'title' => 'Bem-estar feminino',
        'slug' => 'bem-estar-feminino',
        'summary' => 'Conteúdo ainda sem registro de aprovação.',
        'body' => 'Informações educativas.',
        'category_id' => $category->id,
        'status' => EducationalContent::APPROVED,
        'author_id' => $author->id,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/publish")
        ->assertForbidden();

    expect($content->fresh()->status)->toBe(EducationalContent::APPROVED);
});
