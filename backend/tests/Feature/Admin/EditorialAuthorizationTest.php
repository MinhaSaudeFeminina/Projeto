<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('blocks an author from approving content under review', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Vacinas', 'slug' => 'vacinas']);
    $content = EducationalContent::create([
        'title' => 'Vacinas e prevenção',
        'slug' => 'vacinas-e-prevencao',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
        'status' => EducationalContent::IN_REVIEW,
        'author_id' => $author->id,
    ]);

    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/approve")
        ->assertForbidden();

    expect($content->fresh()->status)->toBe(EducationalContent::IN_REVIEW);
});

it('blocks a reviewer from submitting an author draft', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar']);
    $content = EducationalContent::create([
        'title' => 'Bem-estar feminino',
        'slug' => 'bem-estar-feminino',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/submit-review")
        ->assertForbidden();
});

it('allows an admin to request adjustments on content under review', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Climatério', 'slug' => 'climaterio']);
    $content = EducationalContent::create([
        'title' => 'Saúde no climatério',
        'slug' => 'saude-no-climaterio',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
        'status' => EducationalContent::IN_REVIEW,
        'author_id' => $author->id,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/request-adjustments", [
            'comment' => 'Ajustar a orientação profissional.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::DRAFT);
});
