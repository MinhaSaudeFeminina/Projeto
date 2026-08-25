<?php

use App\Models\AdminRole;
use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('busca sem acentos, preserva a grafia e combina filtros administrativos', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $otherAuthor = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima', 'is_active' => true]);
    $otherCategory = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar', 'is_active' => true]);
    $lifeStage = LifeStage::create(['key' => 'climaterio', 'name' => 'Climatério/menopausa', 'sort_order' => 1, 'is_active' => true]);
    $otherLifeStage = LifeStage::create(['key' => 'vida_adulta', 'name' => 'Vida adulta', 'sort_order' => 2, 'is_active' => true]);
    $ageRange = AgeRange::create(['label' => '40-49', 'min_age' => 40, 'max_age' => 49, 'sort_order' => 1, 'is_active' => true]);
    $otherAgeRange = AgeRange::create(['label' => '20-29', 'min_age' => 20, 'max_age' => 29, 'sort_order' => 2, 'is_active' => true]);

    $contentId = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Menstruação, saúde íntima e prevenção',
        'summary' => 'Orientações para o climatério com acentuação preservada.',
        'body' => 'Conteúdo educativo sobre prevenção e quando procurar atendimento profissional.',
        'category_id' => $category->id,
        'life_stage_ids' => [$lifeStage->id],
        'age_range_ids' => [$ageRange->id],
    ])->assertCreated()->json('data.id');

    $otherContentId = $this->actingAs($otherAuthor, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Bem-estar na vida adulta',
        'summary' => 'Outro conteúdo educativo.',
        'body' => 'Orientações gerais.',
        'category_id' => $otherCategory->id,
        'life_stage_ids' => [$otherLifeStage->id],
        'age_range_ids' => [$otherAgeRange->id],
    ])->assertCreated()->json('data.id');
    EducationalContent::query()->whereKey($otherContentId)->update(['status' => EducationalContent::PUBLISHED]);

    foreach (['menstruacao', 'saude', 'prevencao', 'climaterio'] as $term) {
        $this->actingAs($author, 'sanctum')
            ->getJson('/api/v1/admin/contents?q='.$term)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $contentId)
            ->assertJsonPath('data.0.title', 'Menstruação, saúde íntima e prevenção');
    }

    foreach ([
        ['status' => 'draft'],
        ['category_id' => $category->id],
        ['life_stage_id' => $lifeStage->id],
        ['age_range_id' => $ageRange->id],
        ['author_id' => $author->id],
    ] as $filter) {
        $this->actingAs($author, 'sanctum')
            ->getJson('/api/v1/admin/contents?'.http_build_query($filter))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $contentId);
    }

    $query = http_build_query([
        'q' => 'saude',
        'status' => 'draft',
        'category_id' => $category->id,
        'life_stage_id' => $lifeStage->id,
        'age_range_id' => $ageRange->id,
        'author_id' => $author->id,
    ]);

    $this->actingAs($author, 'sanctum')
        ->getJson("/api/v1/admin/contents?{$query}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $contentId);

    $this->assertDatabaseHas('educational_contents', [
        'id' => $contentId,
        'search_text_normalized' => 'menstruacao saude intima e prevencao orientacoes para o climaterio com acentuacao preservada conteudo educativo sobre prevencao e quando procurar atendimento profissional saude intima climaterio menopausa 40 49',
    ]);
});
