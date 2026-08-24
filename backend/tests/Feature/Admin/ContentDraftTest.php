<?php

use App\Models\AdminRole;
use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\LifeStage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates and returns a Portuguese educational content draft', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);
    $lifeStage = LifeStage::create(['key' => 'vida_adulta', 'name' => 'Vida adulta']);
    $ageRange = AgeRange::create(['label' => '20-29', 'min_age' => 20, 'max_age' => 29]);

    $response = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Saúde íntima e menstruação',
        'summary' => 'Orientações educativas com acentuação preservada.',
        'body' => 'Procure atendimento profissional se houver sinais de alerta.',
        'category_id' => $category->id,
        'life_stage_ids' => [$lifeStage->id],
        'age_range_ids' => [$ageRange->id],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonPath('data.title', 'Saúde íntima e menstruação')
        ->assertJsonPath('data.life_stages.0.id', $lifeStage->id)
        ->assertJsonPath('data.age_ranges.0.id', $ageRange->id);

    $contentId = $response->json('data.id');

    $this->assertDatabaseHas('educational_contents', [
        'id' => $contentId,
        'author_id' => $author->id,
        'status' => 'draft',
        'title' => 'Saúde íntima e menstruação',
    ]);
    $this->assertDatabaseHas('editorial_audit_events', [
        'content_id' => $contentId,
        'actor_id' => $author->id,
        'action' => 'content_created',
    ]);
});

it('validates the complete draft payload', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);

    $this->actingAs($author, 'sanctum')
        ->postJson('/api/v1/admin/contents', [
            'title' => '',
            'summary' => '',
            'body' => '',
            'category_id' => 999,
            'life_stage_ids' => [999],
            'age_range_ids' => [999],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'title',
            'summary',
            'body',
            'category_id',
            'life_stage_ids.0',
            'age_range_ids.0',
        ]);
});
