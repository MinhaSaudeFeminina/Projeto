<?php

use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('persists Portuguese text with accents and cedilha unchanged', function (): void {
    $author = User::factory()->create([
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);

    $category = ContentCategory::create([
        'name' => 'Saúde íntima',
        'slug' => 'saude-intima',
        'description' => 'Prevenção, menstruação e autocuidado.',
        'is_active' => true,
    ]);

    $content = EducationalContent::create([
        'title' => 'Menstruação, prevenção e saúde',
        'slug' => 'menstruacao-prevencao-e-saude',
        'summary' => 'Informações sobre cólicas, prevenção e atenção à saúde.',
        'body' => 'Conteúdo educativo em Português do Brasil com acentuação, cedilha e caracteres especiais: ç, ã, é, í.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);

    $content->refresh();

    expect($content->title)->toBe('Menstruação, prevenção e saúde')
        ->and($content->summary)->toContain('cólicas')
        ->and($content->body)->toContain('acentuação, cedilha')
        ->and($content->category->name)->toBe('Saúde íntima');
});
