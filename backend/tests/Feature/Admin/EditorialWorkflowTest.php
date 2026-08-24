<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('moves content through adjustments, resubmission and approval with audit', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);
    $content = EducationalContent::create([
        'title' => 'Saúde íntima e menstruação',
        'slug' => 'saude-intima-e-menstruacao',
        'summary' => 'Conteúdo educativo com acentuação correta.',
        'body' => 'Procure atendimento profissional diante de sinais de alerta.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);

    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/submit-review")
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::IN_REVIEW)
        ->assertJsonPath('data.submitted_by', $author->id);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/request-adjustments", [
            'comment' => 'Revisar a acentuação e explicar quando procurar atendimento.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::DRAFT)
        ->assertJsonPath('data.reviewed_by', $reviewer->id);

    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/submit-review")
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::IN_REVIEW);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/approve", [
            'comment' => 'Conteúdo revisado e adequado para publicação.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', EducationalContent::APPROVED)
        ->assertJsonPath('data.approved_by', $reviewer->id);

    $content->refresh();

    expect($content->submitted_at)->not->toBeNull()
        ->and($content->reviewed_at)->not->toBeNull()
        ->and($content->approved_at)->not->toBeNull();

    $this->assertDatabaseHas('editorial_audit_events', [
        'content_id' => $content->id,
        'action' => 'adjustments_requested',
        'previous_status' => EducationalContent::IN_REVIEW,
        'new_status' => EducationalContent::DRAFT,
        'comment' => 'Revisar a acentuação e explicar quando procurar atendimento.',
    ]);
    $this->assertDatabaseHas('editorial_audit_events', [
        'content_id' => $content->id,
        'action' => 'approved',
        'previous_status' => EducationalContent::IN_REVIEW,
        'new_status' => EducationalContent::APPROVED,
    ]);
    $this->assertDatabaseCount('content_revisions', 4);
});

it('requires an editorial comment when requesting adjustments', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);
    $content = EducationalContent::create([
        'title' => 'Prevenção e cuidado',
        'slug' => 'prevencao-e-cuidado',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
        'status' => EducationalContent::IN_REVIEW,
        'author_id' => $author->id,
    ]);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/request-adjustments", ['comment' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('comment');
});
