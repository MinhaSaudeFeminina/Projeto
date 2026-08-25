<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns the complete editorial audit trail in reverse chronological order', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);

    $contentId = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Prevenção e saúde feminina',
        'summary' => 'Resumo inicial com acentuação.',
        'body' => 'Conteúdo educativo inicial.',
        'category_id' => $category->id,
    ])->assertCreated()->json('data.id');

    $this->actingAs($author, 'sanctum')->patchJson("/api/v1/admin/contents/{$contentId}", [
        'title' => 'Prevenção e saúde integral',
        'summary' => 'Resumo atualizado com acentuação.',
        'body' => 'Conteúdo educativo atualizado.',
        'category_id' => $category->id,
    ])->assertOk();
    $this->actingAs($author, 'sanctum')->postJson("/api/v1/admin/contents/{$contentId}/submit-review")->assertOk();
    $this->actingAs($reviewer, 'sanctum')->postJson("/api/v1/admin/contents/{$contentId}/request-adjustments", [
        'comment' => 'Incluir orientação clara para procurar atendimento profissional.',
    ])->assertOk();
    $this->actingAs($author, 'sanctum')->postJson("/api/v1/admin/contents/{$contentId}/submit-review")->assertOk();
    $this->actingAs($reviewer, 'sanctum')->postJson("/api/v1/admin/contents/{$contentId}/approve", [
        'comment' => 'Conteúdo revisado e aprovado.',
    ])->assertOk();
    $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/contents/{$contentId}/publish")->assertOk();
    $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/contents/{$contentId}/archive")->assertOk();

    $this->actingAs($admin, 'sanctum')
        ->getJson("/api/v1/admin/contents/{$contentId}/audit")
        ->assertOk()
        ->assertJsonCount(8, 'data')
        ->assertJsonPath('data.0.action', 'archived')
        ->assertJsonPath('data.1.action', 'published')
        ->assertJsonPath('data.2.action', 'approved')
        ->assertJsonPath('data.2.actor.name', $reviewer->name)
        ->assertJsonPath('data.4.action', 'adjustments_requested')
        ->assertJsonPath('data.4.comment', 'Incluir orientação clara para procurar atendimento profissional.')
        ->assertJsonPath('data.6.action', 'content_updated')
        ->assertJsonPath('data.7.action', 'content_created');

    $this->assertDatabaseCount('editorial_audit_events', 8);
});
