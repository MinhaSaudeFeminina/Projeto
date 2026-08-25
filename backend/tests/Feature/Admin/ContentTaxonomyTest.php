<?php

use App\Models\AdminRole;
use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\LifeStage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists active taxonomies in editorial order', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    ContentCategory::create(['name' => 'Inativa', 'slug' => 'inativa', 'is_active' => false]);
    $category = ContentCategory::create(['name' => 'Saúde sexual', 'slug' => 'saude-sexual', 'is_active' => true]);
    $stage = LifeStage::create(['key' => 'adolescencia', 'name' => 'Adolescência', 'sort_order' => 10, 'is_active' => true]);
    $range = AgeRange::create(['label' => '15-19', 'min_age' => 15, 'max_age' => 19, 'sort_order' => 10, 'is_active' => true]);

    $this->actingAs($author, 'sanctum')->getJson('/api/v1/admin/taxonomies')
        ->assertOk()
        ->assertJsonPath('data.categories.0.id', $category->id)
        ->assertJsonPath('data.life_stages.0.id', $stage->id)
        ->assertJsonPath('data.age_ranges.0.id', $range->id)
        ->assertJsonMissing(['name' => 'Inativa']);
});

it('synchronizes multiple life stages and age ranges on update', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Ciclo menstrual', 'slug' => 'ciclo-menstrual']);
    $stages = collect([
        LifeStage::create(['key' => 'adolescencia', 'name' => 'Adolescência']),
        LifeStage::create(['key' => 'vida_adulta', 'name' => 'Vida adulta']),
    ]);
    $ranges = collect([
        AgeRange::create(['label' => '15-19', 'min_age' => 15, 'max_age' => 19]),
        AgeRange::create(['label' => '20-29', 'min_age' => 20, 'max_age' => 29]),
    ]);

    $contentId = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Menstruação sem tabu',
        'summary' => 'Informação segura e acolhedora.',
        'body' => 'Material educativo que não substitui atendimento profissional.',
        'category_id' => $category->id,
        'life_stage_ids' => [$stages[0]->id],
        'age_range_ids' => [$ranges[0]->id],
    ])->assertCreated()->json('data.id');

    $this->actingAs($author, 'sanctum')->patchJson("/api/v1/admin/contents/{$contentId}", [
        'life_stage_ids' => $stages->pluck('id')->all(),
        'age_range_ids' => $ranges->pluck('id')->all(),
    ])->assertOk()
        ->assertJsonCount(2, 'data.life_stages')
        ->assertJsonCount(2, 'data.age_ranges');
});
