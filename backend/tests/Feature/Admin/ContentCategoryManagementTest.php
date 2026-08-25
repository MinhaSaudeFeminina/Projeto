<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows admin to create update list and delete content categories', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $categoryId = $this
        ->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/categories', [
            'name' => 'Saúde íntima',
            'description' => 'Conteúdos sobre cuidado íntimo.',
            'sort_order' => 20,
            'is_active' => true,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Saúde íntima')
        ->assertJsonPath('data.slug', 'saude-intima')
        ->json('data.id');

    $this
        ->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/categories/{$categoryId}", [
            'name' => 'Prevenção ginecológica',
            'description' => 'Orientações preventivas.',
            'sort_order' => 10,
            'is_active' => false,
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Prevenção ginecológica')
        ->assertJsonPath('data.slug', 'prevencao-ginecologica')
        ->assertJsonPath('data.is_active', false);

    $this
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/categories')
        ->assertOk()
        ->assertJsonFragment(['name' => 'Prevenção ginecológica']);

    $this
        ->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/categories/{$categoryId}")
        ->assertNoContent();

    expect(ContentCategory::query()->find($categoryId))->toBeNull();
});

it('blocks category management for non admin roles', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde', 'slug' => 'saude']);

    $this
        ->actingAs($author, 'sanctum')
        ->postJson('/api/v1/admin/categories', [
            'name' => 'Bem-estar',
            'sort_order' => 10,
            'is_active' => true,
        ])
        ->assertForbidden();

    $this
        ->actingAs($author, 'sanctum')
        ->patchJson("/api/v1/admin/categories/{$category->id}", [
            'name' => 'Saúde atualizada',
            'sort_order' => 10,
            'is_active' => true,
        ])
        ->assertForbidden();

    $this
        ->actingAs($author, 'sanctum')
        ->deleteJson("/api/v1/admin/categories/{$category->id}")
        ->assertForbidden();
});

it('does not delete categories linked to contents', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Ciclo menstrual', 'slug' => 'ciclo-menstrual']);

    EducationalContent::create([
        'title' => 'Menstruação sem tabu',
        'slug' => 'menstruacao-sem-tabu',
        'summary' => 'Informação educativa.',
        'body' => 'Conteúdo educativo que não substitui atendimento profissional.',
        'category_id' => $category->id,
        'author_id' => $author->id,
        'status' => EducationalContent::DRAFT,
    ]);

    $this
        ->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/categories/{$category->id}")
        ->assertUnprocessable()
        ->assertJsonFragment(['message' => 'Categoria vinculada a conteúdos. Desative a categoria em vez de apagar.']);

    expect($category->fresh())->not->toBeNull();
});
