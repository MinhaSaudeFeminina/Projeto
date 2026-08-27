<?php

use App\Models\AdminRole;
use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function ageRange(array $overrides = []): AgeRange
{
    return AgeRange::create([
        'label' => '10-14',
        'min_age' => 10,
        'max_age' => 14,
        'sort_order' => 10,
        'is_active' => true,
        ...$overrides,
    ]);
}

function trackContent(int $authorId, array $overrides = []): EducationalContent
{
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
        'author_id' => $authorId,
        ...$overrides,
    ]);
}

function lifeStage(array $overrides = []): LifeStage
{
    return LifeStage::create([
        'key' => 'adolescencia',
        'name' => 'Adolescência',
        'description' => 'Informações para jovens de 10 a 19 anos.',
        'sort_order' => 10,
        'is_active' => true,
        ...$overrides,
    ]);
}

it('lists only active life stages by default', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    lifeStage();
    lifeStage(['key' => 'senescencia', 'name' => 'Senescência', 'is_active' => false, 'sort_order' => 60]);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/life-stages')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Adolescência');
});

it('includes drafts when the track screen asks for them', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    lifeStage();
    lifeStage(['key' => 'senescencia', 'name' => 'Senescência', 'is_active' => false, 'sort_order' => 60]);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/life-stages?include_inactive=1')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.1.name', 'Senescência')
        ->assertJsonPath('data.1.is_active', false);
});

it('reports how many contents each track has', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);

    $content = EducationalContent::create([
        'title' => 'Cólica menstrual',
        'slug' => 'colica-menstrual',
        'summary' => 'Orientações educativas.',
        'body' => '<p>Conteúdo</p>',
        'status' => 'draft',
        'category_id' => $category->id,
        'author_id' => $admin->id,
    ]);
    $content->lifeStages()->attach($stage->id);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/life-stages')
        ->assertOk()
        ->assertJsonPath('data.0.contents_count', 1);
});

it('starts tracks with empty lists instead of null', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    lifeStage();

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/life-stages')
        ->assertOk()
        ->assertJsonPath('data.0.warning_signals', [])
        ->assertJsonPath('data.0.reminder_suggestions', []);
});

it('updates the track guidance and lists', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/life-stages/{$stage->id}", [
            'description' => 'Informações para jovens de 10 a 19 anos.',
            'ubs_orientation' => 'A UBS oferece atendimento especializado para adolescentes.',
            'warning_signals' => ['Menstruação muito irregular após 2 anos', 'Cólicas incapacitantes'],
            'reminder_suggestions' => ['Vacina HPV'],
        ])
        ->assertOk()
        ->assertJsonPath('data.ubs_orientation', 'A UBS oferece atendimento especializado para adolescentes.')
        ->assertJsonPath('data.warning_signals.0', 'Menstruação muito irregular após 2 anos')
        ->assertJsonPath('data.reminder_suggestions.0', 'Vacina HPV');

    expect($stage->refresh()->warning_signals)->toHaveCount(2);
});

it('publishes and unpublishes a track', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage(['is_active' => false]);

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/life-stages/{$stage->id}", ['is_active' => true])
        ->assertOk()
        ->assertJsonPath('data.is_active', true);
});

it('keeps the track key immutable', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/life-stages/{$stage->id}", ['key' => 'outra_fase', 'name' => 'Adolescência revisada'])
        ->assertOk();

    expect($stage->refresh()->key)->toBe('adolescencia')
        ->and($stage->name)->toBe('Adolescência revisada');
});

it('validates the track payload', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/life-stages/{$stage->id}", [
            'name' => '',
            'warning_signals' => 'texto em vez de lista',
            'sort_order' => -1,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'warning_signals', 'sort_order']);
});

it('rejects empty entries inside the lists', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/life-stages/{$stage->id}", ['warning_signals' => ['Sangramento', '']])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('warning_signals.1');
});

it('blocks non admin roles from editing tracks', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $stage = lifeStage();

    $this->actingAs($author, 'sanctum')
        ->patchJson("/api/v1/admin/life-stages/{$stage->id}", ['name' => 'Alterado'])
        ->assertForbidden();

    // A leitura segue liberada: autores precisam da taxonomia para marcar conteúdos.
    $this->actingAs($author, 'sanctum')->getJson('/api/v1/admin/life-stages')->assertOk();
});

it('requires authentication', function (): void {
    $this->getJson('/api/v1/admin/life-stages')->assertUnauthorized();
});

it('creates a track in draft, never straight into the app', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $range = ageRange();

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/life-stages', [
            'name' => 'Primeira menstruação',
            'description' => 'O que esperar da menarca.',
            'age_range_id' => $range->id,
        ])
        ->assertCreated()
        ->assertJsonPath('data.status', LifeStage::DRAFT)
        ->assertJsonPath('data.key', 'primeira_menstruacao')
        ->assertJsonPath('data.age_range.label', '10-14');

    expect(LifeStage::query()->where('name', 'Primeira menstruação')->exists())->toBeTrue();
});

it('requires an age range to create a track', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/life-stages', ['name' => 'Sem faixa'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('age_range_id');
});

it('derives a distinct key when two tracks share a name shape', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $range = ageRange();
    lifeStage(['key' => 'gestacao', 'name' => 'Gestacao']);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/life-stages', ['name' => 'Gestação', 'age_range_id' => $range->id])
        ->assertCreated()
        ->assertJsonPath('data.key', 'gestacao_2');
});

it('blocks an author from creating a track', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $range = ageRange();

    $this->actingAs($author, 'sanctum')
        ->postJson('/api/v1/admin/life-stages', ['name' => 'Nova trilha', 'age_range_id' => $range->id])
        ->assertForbidden();
});

it('links contents in the order the panel chose', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();
    $first = trackContent($admin->id);
    $second = trackContent($admin->id, ['title' => 'Absorventes', 'slug' => 'absorventes']);

    $this->actingAs($admin, 'sanctum')
        ->putJson("/api/v1/admin/life-stages/{$stage->id}/contents", [
            'content_ids' => [$second->id, $first->id],
        ])
        ->assertOk()
        ->assertJsonPath('data.contents.0.id', $second->id)
        ->assertJsonPath('data.contents.1.id', $first->id)
        ->assertJsonPath('data.contents_count', 2);
});

it('reorders the linked contents without losing the link', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();
    $first = trackContent($admin->id);
    $second = trackContent($admin->id, ['title' => 'Absorventes', 'slug' => 'absorventes']);

    $this->actingAs($admin, 'sanctum')
        ->putJson("/api/v1/admin/life-stages/{$stage->id}/contents", ['content_ids' => [$first->id, $second->id]])
        ->assertOk();

    $this->actingAs($admin, 'sanctum')
        ->putJson("/api/v1/admin/life-stages/{$stage->id}/contents", ['content_ids' => [$second->id, $first->id]])
        ->assertOk()
        ->assertJsonPath('data.contents.0.id', $second->id);

    expect($stage->contents()->count())->toBe(2);
});

it('unlinks every content when the list comes back empty', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();
    $content = trackContent($admin->id);
    $stage->contents()->attach($content->id, ['sort_order' => 0]);

    $this->actingAs($admin, 'sanctum')
        ->putJson("/api/v1/admin/life-stages/{$stage->id}/contents", ['content_ids' => []])
        ->assertOk()
        ->assertJsonPath('data.contents_count', 0);
});

it('refuses to link an archived content', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage();
    $archived = trackContent($admin->id, ['status' => EducationalContent::ARCHIVED]);

    $this->actingAs($admin, 'sanctum')
        ->putJson("/api/v1/admin/life-stages/{$stage->id}/contents", ['content_ids' => [$archived->id]])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('content_ids.0');
});

it('lets a reviewer professor publish a track', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $stage = lifeStage(['status' => LifeStage::DRAFT, 'age_range_id' => ageRange()->id]);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/life-stages/{$stage->id}/publish")
        ->assertOk()
        ->assertJsonPath('data.status', LifeStage::PUBLISHED);

    expect($stage->refresh()->published_by)->toBe($reviewer->id)
        ->and($stage->published_at)->not->toBeNull();
});

it('blocks an author from publishing a track', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $stage = lifeStage(['status' => LifeStage::DRAFT, 'age_range_id' => ageRange()->id]);

    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/life-stages/{$stage->id}/publish")
        ->assertForbidden();

    expect($stage->refresh()->status)->toBe(LifeStage::DRAFT);
});

it('refuses to publish a track without an age range', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage(['status' => LifeStage::DRAFT, 'age_range_id' => null]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/life-stages/{$stage->id}/publish")
        ->assertUnprocessable();

    expect($stage->refresh()->status)->toBe(LifeStage::DRAFT);
});

it('archives a published track', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $stage = lifeStage(['status' => LifeStage::PUBLISHED, 'age_range_id' => ageRange()->id]);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/life-stages/{$stage->id}/archive")
        ->assertOk()
        ->assertJsonPath('data.status', LifeStage::ARCHIVED)
        ->assertJsonPath('data.is_active', false);
});

it('keeps an archived track out of editing', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage(['status' => LifeStage::ARCHIVED]);

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/life-stages/{$stage->id}", ['name' => 'Alterado'])
        ->assertForbidden();
});

it('deletes a draft track only while it has no contents', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $stage = lifeStage(['status' => LifeStage::DRAFT]);
    $content = trackContent($admin->id);
    $stage->contents()->attach($content->id, ['sort_order' => 0]);

    $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/life-stages/{$stage->id}")
        ->assertUnprocessable();

    $stage->contents()->detach();

    $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/life-stages/{$stage->id}")
        ->assertNoContent();

    expect(LifeStage::query()->find($stage->id))->toBeNull();
});

it('filters the panel list by age range', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $teens = ageRange();
    $adults = ageRange(['label' => '20-29', 'min_age' => 20, 'max_age' => 29, 'sort_order' => 30]);
    lifeStage(['age_range_id' => $teens->id]);
    lifeStage(['key' => 'vida_adulta', 'name' => 'Vida adulta', 'age_range_id' => $adults->id, 'sort_order' => 20]);

    $this->actingAs($admin, 'sanctum')
        ->getJson("/api/v1/admin/life-stages?age_range_id={$adults->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Vida adulta');
});
