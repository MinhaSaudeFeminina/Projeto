<?php

use App\Models\AdminRole;
use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
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

it('creates professor content already approved without a second review', function (): void {
    $professor = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);

    $response = $this->actingAs($professor, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Prevenção e saúde integral',
        'summary' => 'Orientações educativas revisadas pela professora autora.',
        'body' => 'Conteúdo educativo com indicação de atendimento profissional.',
        'category_id' => $category->id,
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.status', EducationalContent::APPROVED)
        ->assertJsonPath('data.author_id', $professor->id)
        ->assertJsonPath('data.reviewed_by', $professor->id)
        ->assertJsonPath('data.approved_by', $professor->id)
        ->assertJsonPath('data.submitted_by', null);

    $contentId = $response->json('data.id');

    $this->assertDatabaseHas('editorial_audit_events', [
        'content_id' => $contentId,
        'actor_id' => $professor->id,
        'action' => 'content_created',
        'new_status' => EducationalContent::APPROVED,
    ]);
});

it('creates admin content already approved without a second review', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar']);

    $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Bem-estar e autocuidado',
        'summary' => 'Orientações educativas aprovadas pela administradora autora.',
        'body' => 'Conteúdo educativo que não substitui atendimento profissional.',
        'category_id' => $category->id,
    ])
        ->assertCreated()
        ->assertJsonPath('data.status', EducationalContent::APPROVED)
        ->assertJsonPath('data.author_id', $admin->id)
        ->assertJsonPath('data.reviewed_by', $admin->id)
        ->assertJsonPath('data.approved_by', $admin->id)
        ->assertJsonPath('data.submitted_by', null);
});
