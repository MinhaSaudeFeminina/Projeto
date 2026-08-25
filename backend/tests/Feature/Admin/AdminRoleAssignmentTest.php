<?php

use App\Models\AdminRole;
use App\Models\Permission;
use App\Models\User;
use Database\Seeders\AdminRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function actingAdminForRoleAssignment(): User
{
    (new AdminRolePermissionSeeder())->run();

    $admin = User::factory()->create([
        'email' => 'role-admin@example.com',
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);

    $admin->adminRoles()->attach(AdminRole::where('key', AdminRole::ADMIN)->firstOrFail());

    return $admin;
}

it('lists canonical roles and permissions for user management screens', function (): void {
    $admin = actingAdminForRoleAssignment();

    $this
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/roles')
        ->assertOk()
        ->assertJsonFragment(['key' => AdminRole::AUTHOR])
        ->assertJsonFragment(['key' => AdminRole::REVIEWER])
        ->assertJsonFragment(['key' => AdminRole::ADMIN]);

    $this
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/permissions')
        ->assertOk()
        ->assertJsonFragment(['key' => 'admin_users.manage'])
        ->assertJsonFragment(['key' => 'roles.manage']);
});

it('allows admin to change an administrative user role', function (): void {
    $admin = actingAdminForRoleAssignment();

    $authorRole = AdminRole::where('key', AdminRole::AUTHOR)->firstOrFail();
    $reviewerRole = AdminRole::where('key', AdminRole::REVIEWER)->firstOrFail();

    $target = User::factory()->create([
        'email' => 'trocar-perfil@example.com',
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);
    $target->adminRoles()->attach($authorRole);

    $this
        ->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/admin-users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'role' => AdminRole::REVIEWER,
            'is_active' => true,
        ])
        ->assertOk()
        ->assertJsonFragment(['role' => AdminRole::REVIEWER]);

    expect($target->adminRoles()->where('admin_roles.id', $reviewerRole->id)->exists())->toBeTrue()
        ->and($target->adminRoles()->where('admin_roles.id', $authorRole->id)->exists())->toBeFalse();
});

it('blocks non-admin roles from assigning administrative profiles', function (): void {
    $admin = actingAdminForRoleAssignment();

    $authorRole = AdminRole::where('key', AdminRole::AUTHOR)->firstOrFail();
    $target = User::factory()->create([
        'email' => 'bloqueada@example.com',
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);
    $target->adminRoles()->attach($authorRole);

    $nonAdmin = User::factory()->create([
        'email' => 'autora-sem-permissao@example.com',
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);
    $nonAdmin->adminRoles()->attach($authorRole);

    $this
        ->actingAs($nonAdmin, 'sanctum')
        ->patchJson("/api/v1/admin/admin-users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'role' => AdminRole::ADMIN,
            'is_active' => true,
        ])
        ->assertForbidden();

    expect(Permission::where('key', 'admin_users.manage')->exists())->toBeTrue()
        ->and($admin->hasPermission('admin_users.manage'))->toBeTrue();
});
