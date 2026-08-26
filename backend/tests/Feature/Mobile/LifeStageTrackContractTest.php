<?php

use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function mobileTrack(array $overrides = []): LifeStage
{
    return LifeStage::create([
        'key' => 'adolescencia',
        'name' => 'Adolescência',
        'description' => 'Informações para jovens de 10 a 19 anos.',
        'status' => LifeStage::PUBLISHED,
        'sort_order' => 10,
        'is_active' => true,
        ...$overrides,
    ]);
}

function mobileTrackContent(array $overrides = []): EducationalContent
{
    $author = User::factory()->create(['user_type' => 'admin_user']);
    $category = ContentCategory::query()->firstOrCreate(
        ['slug' => 'saude-intima'],
        ['name' => 'Saúde íntima'],
    );

    return EducationalContent::create([
        'title' => 'Cólica menstrual',
        'slug' => 'colica-menstrual',
        'summary' => 'Orientações educativas.',
        'body' => '<p>Conteúdo</p>',
        'status' => EducationalContent::PUBLISHED,
        'category_id' => $category->id,
        'author_id' => $author->id,
        ...$overrides,
    ]);
}

it('serves only published tracks to the app', function (): void {
    mobileTrack();
    mobileTrack(['key' => 'rascunho', 'name' => 'Trilha em rascunho', 'status' => LifeStage::DRAFT, 'sort_order' => 20]);
    mobileTrack(['key' => 'arquivada', 'name' => 'Trilha arquivada', 'status' => LifeStage::ARCHIVED, 'sort_order' => 30]);

    $this->getJson('/api/v1/mobile/life-stages')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Adolescência');
});

it('keeps the order the panel chose for the linked contents', function (): void {
    $track = mobileTrack();
    $first = mobileTrackContent();
    $second = mobileTrackContent(['title' => 'Absorventes', 'slug' => 'absorventes']);

    $track->contents()->attach($second->id, ['sort_order' => 0]);
    $track->contents()->attach($first->id, ['sort_order' => 1]);

    $this->getJson('/api/v1/mobile/life-stages')
        ->assertOk()
        ->assertJsonPath('data.0.contents.0.slug', 'absorventes')
        ->assertJsonPath('data.0.contents.1.slug', 'colica-menstrual');
});

it('hides contents that are not published yet, even inside a published track', function (): void {
    $track = mobileTrack();
    $draft = mobileTrackContent(['title' => 'Rascunho', 'slug' => 'rascunho', 'status' => EducationalContent::DRAFT]);
    $published = mobileTrackContent(['title' => 'Absorventes', 'slug' => 'absorventes']);

    $track->contents()->attach($draft->id, ['sort_order' => 0]);
    $track->contents()->attach($published->id, ['sort_order' => 1]);

    $this->getJson('/api/v1/mobile/life-stages')
        ->assertOk()
        ->assertJsonCount(1, 'data.0.contents')
        ->assertJsonPath('data.0.contents.0.slug', 'absorventes');
});

it('filters tracks by age range', function (): void {
    $teens = AgeRange::create(['label' => '10-14', 'min_age' => 10, 'max_age' => 14, 'sort_order' => 10, 'is_active' => true]);
    $adults = AgeRange::create(['label' => '20-29', 'min_age' => 20, 'max_age' => 29, 'sort_order' => 30, 'is_active' => true]);

    mobileTrack(['age_range_id' => $teens->id]);
    mobileTrack(['key' => 'vida_adulta', 'name' => 'Vida adulta', 'age_range_id' => $adults->id, 'sort_order' => 20]);

    $this->getJson("/api/v1/mobile/life-stages?age_range_id={$adults->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Vida adulta')
        ->assertJsonPath('data.0.age_range.label', '20-29');
});

it('does not leak the editorial metadata of the track', function (): void {
    mobileTrack(['published_by' => User::factory()->create(['user_type' => 'admin_user'])->id, 'published_at' => now()]);

    $response = $this->getJson('/api/v1/mobile/life-stages')->assertOk();

    expect($response->json('data.0'))
        ->not->toHaveKey('published_by')
        ->not->toHaveKey('published_at')
        ->not->toHaveKey('status');
});
