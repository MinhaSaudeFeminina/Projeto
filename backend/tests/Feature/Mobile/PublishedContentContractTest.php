<?php

use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\User;
use App\Services\Content\AccentInsensitiveSearchNormalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function createContentForMobile(string $status, ?string $archivedAt = null): EducationalContent
{
    $author = User::factory()->create(['user_type' => 'admin_user']);
    $category = ContentCategory::firstOrCreate(['slug' => Str::slug('Saúde íntima')], ['name' => 'Saúde íntima']);
    $title = "Menstruação {$status}";
    $summary = 'Resumo com acentuação correta.';
    $body = 'Conteúdo educativo com orientação para procurar atendimento quando necessário.';

    return EducationalContent::create([
        'title' => $title,
        'slug' => Str::slug($title),
        'summary' => $summary,
        'body' => $body,
        'category_id' => $category->id,
        'status' => $status,
        'author_id' => $author->id,
        'approved_by' => $author->id,
        'approved_at' => now(),
        'published_by' => $status === EducationalContent::PUBLISHED ? $author->id : null,
        'published_at' => $status === EducationalContent::PUBLISHED ? now() : null,
        'archived_at' => $archivedAt,
        'search_text_normalized' => app(AccentInsensitiveSearchNormalizer::class)->normalize("{$title} {$summary} {$body}"),
    ]);
}

test('mobile content list returns only published non archived content', function () {
    createContentForMobile(EducationalContent::PUBLISHED);
    createContentForMobile(EducationalContent::DRAFT);
    createContentForMobile(EducationalContent::ARCHIVED, now()->toDateTimeString());

    $this->getJson('/api/v1/mobile/contents')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Menstruação Publicado');
});

test('mobile detail hides archived and draft content', function () {
    $draft = createContentForMobile(EducationalContent::DRAFT);

    $this->getJson("/api/v1/mobile/contents/{$draft->slug}")->assertNotFound();
});
