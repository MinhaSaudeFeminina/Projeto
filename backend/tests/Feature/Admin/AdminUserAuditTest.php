<?php

use App\Models\AdminRole;
use App\Models\EditorialAuditEvent;
use App\Models\User;
use Database\Seeders\AdminRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function actingAdminForUserAudit(): User
{
    (new AdminRolePermissionSeeder())->run();

    $admin = User::factory()->create([
        'email' => 'audit-admin@example.com',
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);

    $admin->adminRoles()->attach(AdminRole::where('key', AdminRole::ADMIN)->firstOrFail());

    return $admin;
}

it('records audit events when administrative users are created and updated', function (): void {
    $admin = actingAdminForUserAudit();

    $createResponse = $this
        ->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/admin-users', [
            'name' => 'Auditada Criada',
            'email' => 'auditada@example.com',
            'password' => 'SenhaSegura123',
            'role' => AdminRole::AUTHOR,
            'is_active' => true,
        ])
        ->assertCreated();

    $targetId = $createResponse->json('id') ?? $createResponse->json('data.id');
    $target = User::where('email', 'auditada@example.com')->firstOrFail();

    $this
        ->actingAs($admin, 'sanctum')
        ->patchJson('/api/v1/admin/admin-users/'.($targetId ?? $target->id), [
            'name' => 'Auditada Revisora',
            'email' => 'auditada@example.com',
            'role' => AdminRole::REVIEWER,
            'is_active' => false,
        ])
        ->assertOk();

    expect(EditorialAuditEvent::where('target_admin_user_id', $target->id)->where('action', 'admin_user_created')->exists())->toBeTrue()
        ->and(EditorialAuditEvent::where('target_admin_user_id', $target->id)->where('action', 'role_changed')->exists())->toBeTrue()
        ->and(EditorialAuditEvent::where('target_admin_user_id', $target->id)->where('action', 'admin_user_deactivated')->exists())->toBeTrue();
});

it('does not store passwords or tokens in administrative user audit metadata', function (): void {
    $admin = actingAdminForUserAudit();

    $this
        ->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/admin-users', [
            'name' => 'Segurança Auditoria',
            'email' => 'seguranca-auditoria@example.com',
            'password' => 'SenhaNaoPodeAparecer',
            'role' => AdminRole::AUTHOR,
            'is_active' => true,
        ])
        ->assertCreated();

    $event = EditorialAuditEvent::query()
        ->where('action', 'admin_user_created')
        ->whereHas('actor', fn ($query) => $query->whereKey($admin->id))
        ->latest('occurred_at')
        ->firstOrFail();

    $metadata = json_encode($event->metadata, JSON_UNESCAPED_UNICODE);

    expect($metadata)->not->toContain('SenhaNaoPodeAparecer')
        ->and($metadata)->not->toContain('password')
        ->and($metadata)->not->toContain('token');
});
