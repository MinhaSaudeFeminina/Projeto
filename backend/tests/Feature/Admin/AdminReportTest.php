<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use App\Models\Symptom;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin report returns database aggregates for the selected period', function () {
    [$admin, $token] = adminWithRoleForEditorial(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar']);
    $lifeStage = LifeStage::create([
        'key' => 'adulta',
        'name' => 'Fase adulta',
        'sort_order' => 1,
        'is_active' => true,
    ]);

    $content = EducationalContent::create([
        'title' => "Sa\u{00FA}de \u{00ED}ntima",
        'slug' => 'saude-intima',
        'summary' => 'Resumo.',
        'body' => 'Corpo.',
        'category_id' => $category->id,
        'status' => EducationalContent::PUBLISHED,
        'author_id' => $admin->id,
        'published_by' => $admin->id,
        'published_at' => now(),
    ]);
    $content->lifeStages()->attach($lifeStage);

    Symptom::create(['name' => "C\u{00F3}lica", 'category' => "Menstrua\u{00E7}\u{00E3}o"]);

    $this->withToken($token)->getJson('/api/v1/admin/reports?period=30d')
        ->assertOk()
        ->assertJsonPath('data.period.key', '30d')
        ->assertJsonPath('data.summary.contents_created', 1)
        ->assertJsonPath('data.summary.contents_published', 1)
        ->assertJsonPath('data.summary.symptoms_created', 1)
        ->assertJsonPath('data.content_statuses.3.value', 1)
        ->assertJsonPath('data.life_stages.0.label', 'Fase adulta')
        ->assertJsonPath('data.life_stages.0.value', 1)
        ->assertJsonPath('data.symptom_categories.0.label', "Menstrua\u{00E7}\u{00E3}o");
});

test('admin report requires authentication and validates the period', function () {
    $this->getJson('/api/v1/admin/reports')->assertUnauthorized();

    [, $token] = adminWithRoleForEditorial(AdminRole::ADMIN);

    $this->withToken($token)->getJson('/api/v1/admin/reports?period=invalid')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('period');
});
