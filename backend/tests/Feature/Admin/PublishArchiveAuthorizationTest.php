<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('blocks non-admin users from publishing and archiving content', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);
    $approvedContent = EducationalContent::create([
        'title' => 'Prevenção e autocuidado',
        'slug' => 'prevencao-e-autocuidado',
        'summary' => 'Conteúdo educativo aprovado.',
        'body' => 'Informações educativas para promoção da saúde.',
        'category_id' => $category->id,
        'status' => EducationalContent::APPROVED,
        'author_id' => $author->id,
        'approved_by' => $reviewer->id,
        'approved_at' => now(),
    ]);
    $publishedContent = EducationalContent::create([
        'title' => 'Saúde e qualidade de vida',
        'slug' => 'saude-e-qualidade-de-vida',
        'summary' => 'Conteúdo educativo publicado.',
        'body' => 'Informações educativas para promoção da saúde.',
        'category_id' => $category->id,
        'status' => EducationalContent::PUBLISHED,
        'author_id' => $author->id,
        'approved_by' => $reviewer->id,
        'approved_at' => now()->subMinute(),
        'published_by' => $author->id,
        'published_at' => now(),
    ]);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$approvedContent->id}/publish")
        ->assertForbidden();

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$publishedContent->id}/archive")
        ->assertForbidden();

    expect($approvedContent->fresh()->status)->toBe(EducationalContent::APPROVED)
        ->and($publishedContent->fresh()->status)->toBe(EducationalContent::PUBLISHED);
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
