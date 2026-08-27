<?php

use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('obsolete health scope is removed without affecting unrelated content', function (): void {
    $author = User::factory()->create(['user_type' => 'admin_user']);
    $excludedStage = LifeStage::create([
        'key' => 'gestacao',
        'name' => 'Gestação',
        'sort_order' => 30,
        'is_active' => true,
    ]);
    $allowedStage = LifeStage::create([
        'key' => 'vida_adulta',
        'name' => 'Vida adulta',
        'sort_order' => 20,
        'is_active' => true,
    ]);
    $category = ContentCategory::create([
        'name' => 'Saúde integral',
        'slug' => 'saude-integral',
        'is_active' => true,
    ]);
    $excludedContent = EducationalContent::create([
        'title' => 'Cuidados na gestação',
        'slug' => 'cuidados-na-gestacao',
        'summary' => 'Conteúdo fora do escopo.',
        'body' => 'Orientação educativa.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);
    $allowedContent = EducationalContent::create([
        'title' => 'Cuidados preventivos',
        'slug' => 'cuidados-preventivos',
        'summary' => 'Conteúdo mantido no escopo.',
        'body' => 'Orientação educativa.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);
    $excludedContent->lifeStages()->attach($excludedStage);
    $allowedContent->lifeStages()->attach($allowedStage);

    $migration = require database_path('migrations/2026_08_27_000426_remove_obsolete_health_scope.php');
    $migration->up();

    $this->assertDatabaseMissing('life_stages', ['id' => $excludedStage->id]);
    $this->assertDatabaseMissing('educational_contents', ['id' => $excludedContent->id]);
    $this->assertDatabaseHas('life_stages', ['id' => $allowedStage->id]);
    $this->assertDatabaseHas('educational_contents', ['id' => $allowedContent->id]);
});
