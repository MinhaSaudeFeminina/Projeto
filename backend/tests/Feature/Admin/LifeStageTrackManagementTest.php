<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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
