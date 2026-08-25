<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('responde à busca administrativa em menos de dois segundos com massa realista', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Saúde', 'slug' => 'saude', 'is_active' => true]);
    $now = now();
    $records = [];

    for ($index = 1; $index <= 1000; $index++) {
        $records[] = [
            'title' => "Conteúdo educativo {$index}",
            'slug' => "conteudo-educativo-{$index}",
            'summary' => 'Resumo educativo.',
            'body' => 'Orientações gerais de autocuidado.',
            'category_id' => $category->id,
            'status' => EducationalContent::DRAFT,
            'author_id' => $admin->id,
            'search_text_normalized' => $index % 10 === 0 ? 'saude prevencao menstruacao' : 'bem estar autocuidado',
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    foreach (array_chunk($records, 200) as $chunk) {
        EducationalContent::query()->insert($chunk);
    }

    $startedAt = hrtime(true);
    $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/contents?q=prevencao');
    $elapsedSeconds = (hrtime(true) - $startedAt) / 1_000_000_000;

    $response->assertOk()->assertJsonCount(20, 'data')->assertJsonPath('meta.total', 100);
    expect($elapsedSeconds)->toBeLessThan(2.0);
});
