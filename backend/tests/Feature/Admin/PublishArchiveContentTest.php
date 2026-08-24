<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('publishes and archives approved content with audit and revisions', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Saúde integral', 'slug' => 'saude-integral']);
    $content = EducationalContent::create([
        'title' => 'Cuidado integral da saúde feminina',
        'slug' => 'cuidado-integral-da-saude-feminina',
        'summary' => 'Orientações educativas revisadas.',
        'body' => 'Procure atendimento profissional diante de sinais de alerta.',
        'category_id' => $category->id,
        'status' => EducationalContent::APPROVED,
        'author_id' => $author->id,
        'reviewed_by' => $reviewer->id,
        'reviewed_at' => now()->subMinute(),
        'approved_by' => $reviewer->id,
        'approved_at' => now()->subMinute(),
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/publish")
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::PUBLISHED)
        ->assertJsonPath('data.published_by', $admin->id);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/archive")
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::ARCHIVED)
        ->assertJsonPath('data.archived_by', $admin->id);

    $content->refresh();

    expect($content->published_at)->not->toBeNull()
        ->and($content->archived_at)->not->toBeNull();

    $this->assertDatabaseHas('editorial_audit_events', [
        'content_id' => $content->id,
        'actor_id' => $admin->id,
        'action' => 'published',
        'previous_status' => EducationalContent::APPROVED,
        'new_status' => EducationalContent::PUBLISHED,
    ]);
    $this->assertDatabaseHas('editorial_audit_events', [
        'content_id' => $content->id,
        'actor_id' => $admin->id,
        'action' => 'archived',
        'previous_status' => EducationalContent::PUBLISHED,
        'new_status' => EducationalContent::ARCHIVED,
    ]);
    $this->assertDatabaseCount('content_revisions', 2);
});
