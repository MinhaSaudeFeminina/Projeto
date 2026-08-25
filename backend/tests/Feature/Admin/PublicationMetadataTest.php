<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('preserves editorial metadata after publication and archival', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Ciclo de vida', 'slug' => 'ciclo-de-vida']);
    $submittedAt = now()->subHours(3)->startOfSecond();
    $reviewedAt = now()->subHours(2)->startOfSecond();
    $approvedAt = now()->subHour()->startOfSecond();
    $content = EducationalContent::create([
        'title' => 'Cuidados em cada fase da vida',
        'slug' => 'cuidados-em-cada-fase-da-vida',
        'summary' => 'Conteúdo com histórico editorial completo.',
        'body' => 'Orientações educativas para diferentes fases da vida.',
        'category_id' => $category->id,
        'status' => EducationalContent::APPROVED,
        'author_id' => $author->id,
        'submitted_by' => $author->id,
        'submitted_at' => $submittedAt,
        'reviewed_by' => $reviewer->id,
        'reviewed_at' => $reviewedAt,
        'approved_by' => $reviewer->id,
        'approved_at' => $approvedAt,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/publish")
        ->assertOk();
    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/archive")
        ->assertOk();

    $this->actingAs($admin, 'sanctum')
        ->getJson("/api/v1/admin/contents/{$content->id}")
        ->assertOk()
        ->assertJsonPath('data.author_id', $author->id)
        ->assertJsonPath('data.submitted_by', $author->id)
        ->assertJsonPath('data.reviewed_by', $reviewer->id)
        ->assertJsonPath('data.approved_by', $reviewer->id)
        ->assertJsonPath('data.published_by', $admin->id)
        ->assertJsonPath('data.archived_by', $admin->id)
        ->assertJsonPath('data.submitted_at', $submittedAt->toJSON())
        ->assertJsonPath('data.reviewed_at', $reviewedAt->toJSON())
        ->assertJsonPath('data.approved_at', $approvedAt->toJSON())
        ->assertJson(fn ($json) => $json
            ->has('data.published_at')
            ->has('data.archived_at')
            ->etc());
});
