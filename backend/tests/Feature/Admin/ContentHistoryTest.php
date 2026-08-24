<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns versioned content snapshots with the responsible user', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $contentId = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Saúde íntima',
        'summary' => 'Primeira versão do resumo.',
        'body' => 'Primeira versão do conteúdo.',
        'category_id' => $category->id,
    ])->assertCreated()->json('data.id');

    $this->actingAs($author, 'sanctum')->patchJson("/api/v1/admin/contents/{$contentId}", [
        'title' => 'Saúde íntima e prevenção',
        'summary' => 'Segunda versão do resumo.',
        'body' => 'Segunda versão do conteúdo educativo.',
        'category_id' => $category->id,
    ])->assertOk();
    $this->actingAs($author, 'sanctum')->postJson("/api/v1/admin/contents/{$contentId}/submit-review")->assertOk();

    $this->actingAs($author, 'sanctum')
        ->getJson("/api/v1/admin/contents/{$contentId}/revisions")
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('data.0.version', 3)
        ->assertJsonPath('data.0.status_snapshot', EducationalContent::IN_REVIEW)
        ->assertJsonPath('data.0.changed_by', $author->id)
        ->assertJsonPath('data.0.changed_by_user.name', $author->name)
        ->assertJsonPath('data.1.version', 2)
        ->assertJsonPath('data.1.title_snapshot', 'Saúde íntima e prevenção')
        ->assertJsonPath('data.2.version', 1)
        ->assertJsonPath('data.2.title_snapshot', 'Saúde íntima');
});
