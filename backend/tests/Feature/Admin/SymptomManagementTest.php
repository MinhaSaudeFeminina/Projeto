<?php

use App\Models\AdminRole;
use App\Models\EditorialAuditEvent;
use App\Models\Symptom;
use App\Models\SymptomRecord;
use App\Models\User;
use Database\Seeders\SymptomCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function validSymptomPayload(array $overrides = []): array
{
    return [
        'name' => 'Dor pélvica',
        'type' => 'dor',
        'short_description' => 'Dor na região pélvica.',
        'full_description' => 'Queixa de dor persistente na parte inferior do abdômen.',
        'icon' => 'AlertTriangle',
        'category' => 'Saúde íntima',
        'show_in_app' => true,
        'ask_intensity' => true,
        'ask_notes' => true,
        'generate_ubs_alert' => true,
        'orientation_text' => 'Registre duração e intensidade para conversar com uma profissional de saúde.',
        'severity_alert_text' => 'Dor intensa, súbita ou acompanhada de febre requer avaliação profissional.',
        'sort_order' => 2,
        ...$overrides,
    ];
}

it('requires an authenticated administrative user to access symptoms', function (): void {
    $this->getJson('/api/v1/admin/symptoms')->assertUnauthorized();
    $this->postJson('/api/v1/admin/symptoms', validSymptomPayload())->assertUnauthorized();
});

it('allows authenticated administrative roles to list and view the catalog', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $symptom = Symptom::create([
        'name' => 'Cólica',
        'type' => 'dor',
        'short_description' => 'Dor no baixo ventre.',
        'category' => 'Menstruação',
        'show_in_app' => true,
        'ask_intensity' => true,
        'ask_notes' => false,
        'is_alert_candidate' => false,
        'sort_order' => 1,
    ]);

    $this->actingAs($author, 'sanctum')
        ->getJson('/api/v1/admin/symptoms')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Cólica')
        ->assertJsonPath('data.0.generate_ubs_alert', false);

    $this->actingAs($author, 'sanctum')
        ->getJson("/api/v1/admin/symptoms/{$symptom->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $symptom->id);
});

it('allows only admins to create update and delete catalog entries with audit events', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $symptomId = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/symptoms', validSymptomPayload())
        ->assertCreated()
        ->assertJsonPath('message', 'Sintoma ou queixa criado com sucesso.')
        ->assertJsonPath('data.name', 'Dor pélvica')
        ->assertJsonPath('data.full_description', 'Queixa de dor persistente na parte inferior do abdômen.')
        ->assertJsonPath('data.generate_ubs_alert', true)
        ->json('data.id');

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/symptoms/{$symptomId}", [
            'name' => 'Dor pélvica intensa',
            'show_in_app' => false,
            'generate_ubs_alert' => false,
        ])
        ->assertOk()
        ->assertJsonPath('message', 'Sintoma ou queixa atualizado com sucesso.')
        ->assertJsonPath('data.name', 'Dor pélvica intensa')
        ->assertJsonPath('data.show_in_app', false)
        ->assertJsonPath('data.generate_ubs_alert', false);

    expect(EditorialAuditEvent::query()->where('action', 'symptom_created')->exists())->toBeTrue()
        ->and(EditorialAuditEvent::query()->where('action', 'symptom_updated')->exists())->toBeTrue();

    $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/symptoms/{$symptomId}")
        ->assertNoContent();

    expect(Symptom::query()->find($symptomId))->toBeNull()
        ->and(EditorialAuditEvent::query()->where('action', 'symptom_deleted')->exists())->toBeTrue();
});

it('blocks catalog mutations for non admin roles', function (): void {
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $symptom = Symptom::create(['name' => 'Cólica']);

    $this->actingAs($reviewer, 'sanctum')
        ->postJson('/api/v1/admin/symptoms', validSymptomPayload())
        ->assertForbidden();

    $this->actingAs($reviewer, 'sanctum')
        ->patchJson("/api/v1/admin/symptoms/{$symptom->id}", ['show_in_app' => false])
        ->assertForbidden();

    $this->actingAs($reviewer, 'sanctum')
        ->deleteJson("/api/v1/admin/symptoms/{$symptom->id}")
        ->assertForbidden();
});

it('validates catalog data and unique names', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    Symptom::create(['name' => 'Cólica']);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/symptoms', validSymptomPayload([
            'name' => 'Cólica',
            'type' => '',
            'sort_order' => -1,
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'type', 'sort_order']);
});

it('supports accent tolerant search and catalog filters', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    Symptom::create([
        'name' => 'Alteração de humor',
        'type' => 'emocional',
        'category' => 'TPM e emoções',
        'show_in_app' => true,
        'is_alert_candidate' => false,
        'search_text_normalized' => 'alteracao de humor emocional tpm e emocoes',
    ]);
    Symptom::create([
        'name' => 'Dor pélvica',
        'type' => 'dor',
        'category' => 'Saúde íntima',
        'show_in_app' => false,
        'is_alert_candidate' => true,
        'search_text_normalized' => 'dor pelvica dor saude intima',
    ]);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/symptoms?q=alteracao&category=TPM%20e%20emoções&show_in_app=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Alteração de humor');

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/symptoms?generate_ubs_alert=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Dor pélvica');
});

it('preserves health records by blocking deletion of a used catalog entry', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $mobileUser = User::factory()->create(['user_type' => 'mobile_user']);
    $symptom = Symptom::create(['name' => 'Dor pélvica']);
    SymptomRecord::create([
        'user_id' => $mobileUser->id,
        'symptom_id' => $symptom->id,
        'intensity' => 8,
        'occurred_on' => '2026-08-25',
        'alert_shown' => true,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/symptoms/{$symptom->id}")
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Este item possui registros associados. Desative sua exibição em vez de excluí-lo.');

    expect($symptom->fresh())->not->toBeNull();
});

it('seeds an idempotent canonical catalog', function (): void {
    $this->seed(SymptomCatalogSeeder::class);
    $this->seed(SymptomCatalogSeeder::class);

    expect(Symptom::query()->count())->toBe(12)
        ->and(Symptom::query()->where('name', 'Cólica')->value('show_in_app'))->toBeTrue()
        ->and(Symptom::query()->where('name', 'Dor pélvica')->value('is_alert_candidate'))->toBeTrue();
});
