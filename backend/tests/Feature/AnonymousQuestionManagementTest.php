<?php

use App\Models\AdminRole;
use App\Models\AnonymousQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows reviewers to list and search anonymous questions without accents', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    AnonymousQuestion::factory()->create([
        'question' => 'Estou com cólicas muito fortes. O que devo fazer?',
        'category' => 'Menstruação',
        'priority' => AnonymousQuestion::HIGH_PRIORITY,
    ]);
    AnonymousQuestion::factory()->create([
        'question' => 'Como cuidar da alimentação?',
        'category' => 'Bem-estar',
        'priority' => AnonymousQuestion::LOW_PRIORITY,
    ]);

    $this->actingAs($reviewer, 'sanctum')
        ->getJson('/api/v1/admin/anonymous-questions?q=colicas&priority=alta')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.category', 'Menstruação')
        ->assertJsonPath('meta.total', 1);
});

it('persists an answer and archives an anonymous question with responsible users', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $question = AnonymousQuestion::factory()->create();

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/anonymous-questions/{$question->id}/answer", [
            'answer' => 'Procure sua UBS para uma avaliação individualizada.',
            'internal_notes' => 'Resposta revisada pela equipe.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', AnonymousQuestion::ANSWERED)
        ->assertJsonPath('data.answered_by', $reviewer->id)
        ->assertJsonPath('data.answered_by_user.name', $reviewer->name);

    $this->assertDatabaseHas('anonymous_questions', [
        'id' => $question->id,
        'status' => AnonymousQuestion::ANSWERED,
        'answered_by' => $reviewer->id,
        'answer' => 'Procure sua UBS para uma avaliação individualizada.',
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/anonymous-questions/{$question->id}/archive")
        ->assertOk()
        ->assertJsonPath('data.status', AnonymousQuestion::ARCHIVED)
        ->assertJsonPath('data.archived_by', $admin->id)
        ->assertJsonPath('data.archived_by_user.name', $admin->name);

    expect($question->fresh()->answered_at)->not->toBeNull()
        ->and($question->fresh()->archived_at)->not->toBeNull();
});

it('validates answers and blocks authors and unauthenticated access', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $question = AnonymousQuestion::factory()->create();

    $this->getJson('/api/v1/admin/anonymous-questions')->assertUnauthorized();
    $this->actingAs($author, 'sanctum')
        ->getJson('/api/v1/admin/anonymous-questions')
        ->assertForbidden();
    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/anonymous-questions/{$question->id}/answer", ['answer' => '   '])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('answer');
});

it('does not allow answering an archived question', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $question = AnonymousQuestion::factory()->create([
        'status' => AnonymousQuestion::ARCHIVED,
        'archived_at' => now(),
    ]);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/anonymous-questions/{$question->id}/answer", [
            'answer' => 'Resposta tardia.',
        ])
        ->assertConflict();
});
