<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('blocks an author from editing another author draft', function (): void {
    $owner = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $otherAuthor = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);
    $content = EducationalContent::create([
        'title' => 'Prevenção e saúde',
        'slug' => 'prevencao-e-saude',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $owner->id,
    ]);

    $this->actingAs($otherAuthor, 'sanctum')
        ->patchJson("/api/v1/admin/contents/{$content->id}", ['title' => 'Alteração indevida'])
        ->assertForbidden();

    expect($content->fresh()->title)->toBe('Prevenção e saúde');
});

it('allows the owner to edit only while content is a draft', function (): void {
    $owner = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar']);
    $content = EducationalContent::create([
        'title' => 'Bem-estar',
        'slug' => 'bem-estar',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $owner->id,
    ]);

    $this->actingAs($owner, 'sanctum')
        ->patchJson("/api/v1/admin/contents/{$content->id}", ['title' => 'Bem-estar feminino'])
        ->assertOk()
        ->assertJsonPath('data.title', 'Bem-estar feminino');

    $content->update(['status' => EducationalContent::IN_REVIEW]);

    $this->actingAs($owner, 'sanctum')
        ->patchJson("/api/v1/admin/contents/{$content->id}", ['title' => 'Nova alteração'])
        ->assertForbidden();
});
