<?php

use App\Models\AdminRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

function createInactiveAdminUser(): User
{
    $role = AdminRole::create([
        'key' => AdminRole::ADMIN,
        'name' => 'Admin',
        'description' => 'Administrative user',
    ]);

    $user = User::factory()->create([
        'email' => 'inactive-admin@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'admin_user',
        'is_active' => false,
    ]);

    $user->adminRoles()->attach($role);

    return $user;
}

it('rejects login for inactive administrative users', function (): void {
    createInactiveAdminUser();

    $this
        ->postJson('/api/v1/admin/auth/login', [
            'email' => 'inactive-admin@example.com',
            'password' => 'password',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('blocks inactive administrative users from protected admin routes', function (): void {
    Route::middleware(['auth:sanctum', 'admin.role'])->get(
        '/api/teste-admin-inativo',
        fn () => response()->json(['ok' => true]),
    );

    $inactiveAdmin = createInactiveAdminUser();

    $this
        ->actingAs($inactiveAdmin, 'sanctum')
        ->getJson('/api/teste-admin-inativo')
        ->assertForbidden();
});
