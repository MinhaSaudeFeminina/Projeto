<?php

use App\Models\AdminRole;
use App\Models\SupportContact;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows admin to manage support contacts', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $contactId = $this
        ->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/support-contacts', [
            'name' => 'Casa da Mulher Brasileira',
            'description' => 'Acolhimento e orientação para mulheres em situação de violência.',
            'type' => 'seguranca',
            'phone' => '180',
            'link' => 'https://www.gov.br',
            'cta_label' => 'Saiba mais',
            'sort_order' => 15,
            'is_highlighted' => true,
            'is_active' => true,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Casa da Mulher Brasileira')
        ->assertJsonPath('data.is_highlighted', true)
        ->json('data.id');

    $this
        ->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/support-contacts/{$contactId}", [
            'name' => 'Casa da Mulher Brasileira',
            'description' => 'Atendimento integrado e orientação para mulheres.',
            'type' => 'seguranca',
            'phone' => null,
            'link' => null,
            'cta_label' => 'Ver orientação',
            'sort_order' => 5,
            'is_highlighted' => false,
            'is_active' => false,
        ])
        ->assertOk()
        ->assertJsonPath('data.description', 'Atendimento integrado e orientação para mulheres.')
        ->assertJsonPath('data.is_active', false);

    $this
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/support-contacts')
        ->assertOk()
        ->assertJsonFragment(['name' => 'Casa da Mulher Brasileira']);

    $this
        ->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/support-contacts/{$contactId}")
        ->assertNoContent();

    expect(SupportContact::query()->find($contactId))->toBeNull();
});

it('blocks support contact management for non admin roles', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $contact = SupportContact::create([
        'name' => 'Serviço de apoio',
        'description' => 'Descrição educativa.',
        'type' => 'apoio',
        'cta_label' => 'Saiba mais',
    ]);

    $this
        ->actingAs($author, 'sanctum')
        ->getJson('/api/v1/admin/support-contacts')
        ->assertForbidden();

    $this
        ->actingAs($author, 'sanctum')
        ->patchJson("/api/v1/admin/support-contacts/{$contact->id}", [
            'name' => 'Serviço atualizado',
            'description' => 'Descrição atualizada.',
            'type' => 'apoio',
            'phone' => null,
            'link' => null,
            'cta_label' => 'Saiba mais',
            'sort_order' => 0,
            'is_highlighted' => false,
            'is_active' => true,
        ])
        ->assertForbidden();
});
