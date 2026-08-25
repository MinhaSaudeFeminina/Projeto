<?php

use App\Models\AdminRole;
use App\Models\User;
use Database\Seeders\AdminRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function actingAdminForUserManagement(): User
{
    (new AdminRolePermissionSeeder())->run();

    $admin = User::factory()->create([
        'name' => 'Admin Gestora',
        'email' => 'admin-users@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);

    $adminRole = AdminRole::where('key', AdminRole::ADMIN)->firstOrFail();
    $admin->adminRoles()->attach($adminRole);

    return $admin;
}

it('allows admin to list administrative users without exposing passwords', function (): void {
    $admin = actingAdminForUserManagement();

    $authorRole = AdminRole::where('key', AdminRole::AUTHOR)->firstOrFail();
    $author = User::factory()->create([
        'name' => 'Dra. Maria Eduarda',
        'email' => 'maria.autora@example.com',
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);
    $author->adminRoles()->attach($authorRole);

    $this
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/admin-users')
        ->assertOk()
        ->assertJsonFragment([
            'email' => 'maria.autora@example.com',
            'role' => AdminRole::AUTHOR,
            'is_active' => true,
        ])
        ->assertJsonMissingPath('0.password')
        ->assertJsonMissingPath('data.0.password');
});

it('allows admin to create an active administrative user with a canonical role', function (): void {
    $admin = actingAdminForUserManagement();

    $this
        ->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/admin-users', [
            'name' => 'Profa. Helena Revisora',
            'email' => 'helena.revisora@example.com',
            'password' => 'SenhaSegura123',
            'role' => AdminRole::REVIEWER,
            'is_active' => true,
        ])
        ->assertCreated()
        ->assertJsonFragment([
            'name' => 'Profa. Helena Revisora',
            'email' => 'helena.revisora@example.com',
            'role' => AdminRole::REVIEWER,
            'is_active' => true,
        ])
        ->assertJsonMissingPath('password');

    $created = User::where('email', 'helena.revisora@example.com')->firstOrFail();

    expect($created->isAdminUser())->toBeTrue()
        ->and($created->is_active)->toBeTrue()
        ->and($created->adminRoles()->where('key', AdminRole::REVIEWER)->exists())->toBeTrue()
        ->and(Hash::check('SenhaSegura123', $created->password))->toBeTrue();
});

it('allows admin to update and deactivate an administrative user', function (): void {
    $admin = actingAdminForUserManagement();

    $authorRole = AdminRole::where('key', AdminRole::AUTHOR)->firstOrFail();
    $target = User::factory()->create([
        'name' => 'Acadêmica Ana',
        'email' => 'ana.autora@example.com',
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);
    $target->adminRoles()->attach($authorRole);

    $this
        ->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/admin-users/{$target->id}", [
            'name' => 'Acadêmica Ana Paula',
            'email' => 'ana.paula@example.com',
            'role' => AdminRole::AUTHOR,
            'is_active' => false,
        ])
        ->assertOk()
        ->assertJsonFragment([
            'name' => 'Acadêmica Ana Paula',
            'email' => 'ana.paula@example.com',
            'is_active' => false,
        ]);

    $target->refresh();

    expect($target->name)->toBe('Acadêmica Ana Paula')
        ->and($target->email)->toBe('ana.paula@example.com')
        ->and($target->is_active)->toBeFalse();
});
