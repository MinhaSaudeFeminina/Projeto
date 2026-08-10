<?php

use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\User;
use App\Services\Content\AccentInsensitiveSearchNormalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('search without accents finds content and preserves displayed spelling', function () {
    $author = User::factory()->create(['user_type' => 'admin_user']);
    $category = ContentCategory::create(['name' => 'Ciclo menstrual', 'slug' => 'ciclo-menstrual']);
    $title = 'Cuidados com a menstruação';
    $summary = 'Prevenção e saúde íntima com acolhimento.';
    $body = 'A menstruação deve ser acompanhada sem julgamentos.';

    EducationalContent::create([
        'title' => $title,
        'slug' => 'cuidados-com-a-menstruacao',
        'summary' => $summary,
        'body' => $body,
        'category_id' => $category->id,
        'status' => EducationalContent::PUBLISHED,
        'author_id' => $author->id,
        'approved_by' => $author->id,
        'approved_at' => now(),
        'published_by' => $author->id,
        'published_at' => now(),
        'search_text_normalized' => app(AccentInsensitiveSearchNormalizer::class)->normalize("{$title} {$summary} {$body}"),
    ]);

    $this->getJson('/api/v1/mobile/contents?q=menstruacao')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Cuidados com a menstruação')
        ->assertJsonPath('data.0.summary', 'Prevenção e saúde íntima com acolhimento.');
});
