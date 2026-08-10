<?php

use App\Models\AdminRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function createActiveAdminUser(array $attributes = []): User
{
    $role = AdminRole::create([
        'key' => AdminRole::ADMIN,
        'name' => 'Admin',
        'description' => 'Administrative user',
    ]);

    $user = User::factory()->create([
        'name' => 'Admin Test',
        'email' => 'admin@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'admin_user',
        'is_active' => true,
        ...$attributes,
    ]);

    $user->adminRoles()->attach($role);

    return $user;
}

test('administrative user can login with email and password', function (): void {
    createActiveAdminUser();

    $this
        ->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])
        ->assertOk()
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'email', 'roles'],
        ])
        ->assertJsonPath('user.email', 'admin@example.com')
        ->assertJsonPath('user.roles.0', AdminRole::ADMIN);
});

test('authenticated administrative user can read their profile', function (): void {
    createActiveAdminUser();

    $token = $this
        ->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])
        ->json('token');

    $this
        ->withToken($token)
        ->getJson('/api/v1/admin/auth/me')
        ->assertOk()
        ->assertJsonPath('user.email', 'admin@example.com')
        ->assertJsonPath('user.roles.0', AdminRole::ADMIN);
});

test('administrative logout revokes the current token', function (): void {
    $user = createActiveAdminUser();

    $token = $this
        ->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])
        ->json('token');

    $this
        ->withToken($token)
        ->postJson('/api/v1/admin/auth/logout')
        ->assertNoContent();

    expect($user->tokens()->count())->toBe(0);

    Auth::guard('sanctum')->forgetUser();

    $this
        ->withToken($token)
        ->getJson('/api/v1/admin/auth/me')
        ->assertUnauthorized();
});

test('invalid administrative credentials are rejected', function (): void {
    createActiveAdminUser();

    $this->postJson('/api/v1/admin/auth/login', [
        'email' => 'admin@example.com',
        'password' => 'wrong-password',
    ])->assertUnprocessable();
});

test('mobile user cannot login through admin endpoint', function (): void {
    User::factory()->create([
        'email' => 'mobile@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'mobile_user',
    ]);

    $this->postJson('/api/v1/admin/auth/login', [
        'email' => 'mobile@example.com',
        'password' => 'password',
    ])->assertUnprocessable();
});
