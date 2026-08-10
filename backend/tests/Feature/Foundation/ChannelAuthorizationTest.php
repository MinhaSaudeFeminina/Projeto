<?php

use App\Models\AdminRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('mobile user cannot access admin authenticated endpoint', function () {
    $user = User::factory()->create([
        'user_type' => 'mobile_user',
        'password' => Hash::make('password'),
    ]);

    $token = $user->createToken('mobile')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/admin/auth/me')->assertForbidden();
});

test('admin user can access admin authenticated endpoint', function () {
    $role = AdminRole::create(['name' => AdminRole::ADMIN, 'permissions' => ['*']]);
    $user = User::factory()->create([
        'user_type' => 'admin_user',
        'is_active' => true,
        'password' => Hash::make('password'),
    ]);
    $user->adminRoles()->attach($role);

    $token = $user->createToken('admin-web', ['admin'])->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/admin/auth/me')->assertOk();
});
