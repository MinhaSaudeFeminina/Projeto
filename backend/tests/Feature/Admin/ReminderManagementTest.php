<?php

use App\Models\AdminRole;
use App\Models\Reminder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function reminderPayload(array $overrides = []): array
{
    return [
        'title' => 'Exame preventivo (Papanicolau)',
        'description' => 'Lembrete para realização do exame preventivo.',
        'type' => 'exame_preventivo',
        'priority' => 'alta',
        'audience' => 'Mulheres 25-64 anos',
        'periodicity' => 'Anual',
        'start_date' => '2026-01-01',
        'end_date' => null,
        'short_message' => 'Está na hora do seu preventivo!',
        'expanded_message' => 'Procure a UBS para agendar o exame preventivo.',
        'is_active' => true,
        ...$overrides,
    ];
}

it('lists reminders with the active ones first', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    Reminder::factory()->inactive()->create(['title' => 'Campanha encerrada']);
    Reminder::factory()->campaign()->create();

    $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/reminders');

    $response->assertOk()
        ->assertJsonPath('data.0.title', 'Outubro Rosa')
        ->assertJsonPath('data.0.is_active', true)
        ->assertJsonPath('data.1.title', 'Campanha encerrada');
});

it('creates a reminder preserving accents', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/reminders', reminderPayload());

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Exame preventivo (Papanicolau)')
        ->assertJsonPath('data.short_message', 'Está na hora do seu preventivo!')
        ->assertJsonPath('data.start_date', '2026-01-01');

    $this->assertDatabaseHas('reminders', [
        'id' => $response->json('data.id'),
        'created_by' => $admin->id,
        'type' => 'exame_preventivo',
    ]);
});

it('finds reminders ignoring accents and case', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    Reminder::factory()->create(['title' => 'Vacinação contra HPV']);
    Reminder::factory()->create(['title' => 'Mamografia']);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/reminders?q=vacinacao')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Vacinação contra HPV');
});

it('filters reminders by type', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    Reminder::factory()->campaign()->create();
    Reminder::factory()->create(['title' => 'Mamografia', 'type' => 'mamografia']);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/reminders?type=campanha')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.type', 'campanha');
});

it('updates a reminder partially', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $reminder = Reminder::factory()->create();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/reminders/{$reminder->id}", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('data.is_active', false)
        ->assertJsonPath('data.title', $reminder->title);

    expect($reminder->refresh()->updated_by)->toBe($admin->id);
});

it('accepts an end date sent without the start date', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $reminder = Reminder::factory()->create(['start_date' => '2026-01-01']);

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/reminders/{$reminder->id}", ['end_date' => '2026-06-30'])
        ->assertOk()
        ->assertJsonPath('data.end_date', '2026-06-30');
});

it('rejects an end date before the stored start date', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $reminder = Reminder::factory()->create(['start_date' => '2026-05-01']);

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/reminders/{$reminder->id}", ['end_date' => '2026-01-01'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('end_date');
});

it('validates the reminder payload', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/reminders', reminderPayload([
            'title' => '',
            'type' => 'inexistente',
            'priority' => 'altissima',
            'start_date' => '01/01/2026',
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'type', 'priority', 'start_date']);
});

it('duplicates a reminder as an inactive copy', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $reminder = Reminder::factory()->campaign()->create();

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/reminders/{$reminder->id}/duplicate");

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Outubro Rosa (cópia)')
        ->assertJsonPath('data.is_active', false)
        ->assertJsonPath('data.type', 'campanha');

    expect(Reminder::count())->toBe(2);
});

it('numbers repeated copies instead of colliding', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $reminder = Reminder::factory()->campaign()->create();

    $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/reminders/{$reminder->id}/duplicate")->assertCreated();

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/reminders/{$reminder->id}/duplicate")
        ->assertCreated()
        ->assertJsonPath('data.title', 'Outubro Rosa (cópia 2)');
});

it('deletes a reminder', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $reminder = Reminder::factory()->create();

    $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/reminders/{$reminder->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('reminders', ['id' => $reminder->id]);
});

it('blocks non admin roles from managing reminders', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reminder = Reminder::factory()->create();

    $this->actingAs($author, 'sanctum')->getJson('/api/v1/admin/reminders')->assertForbidden();
    $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/reminders', reminderPayload())->assertForbidden();
    $this->actingAs($author, 'sanctum')->patchJson("/api/v1/admin/reminders/{$reminder->id}", ['is_active' => false])->assertForbidden();
    $this->actingAs($author, 'sanctum')->deleteJson("/api/v1/admin/reminders/{$reminder->id}")->assertForbidden();
});

it('requires authentication', function (): void {
    $this->getJson('/api/v1/admin/reminders')->assertUnauthorized();
});
