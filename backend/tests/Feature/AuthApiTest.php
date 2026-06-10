<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

uses(RefreshDatabase::class);

test('user can register and receive an api token', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Maria Silva',
        'email' => 'maria@example.com',
        'password' => 'password',
    ]);

    $response
        ->assertCreated()
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'email'],
        ])
        ->assertJsonPath('user.email', 'maria@example.com');

    $this->assertDatabaseHas('users', [
        'email' => 'maria@example.com',
    ]);
});

test('user can login and fetch authenticated profile', function () {
    User::factory()->create([
        'email' => 'maria@example.com',
        'password' => Hash::make('password'),
    ]);

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => 'maria@example.com',
        'password' => 'password',
    ]);

    $token = $loginResponse
        ->assertOk()
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'email'],
        ])
        ->json('token');

    $this
        ->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('user.email', 'maria@example.com');
});

test('user can logout and revoke current token', function () {
    User::factory()->create([
        'email' => 'maria@example.com',
        'password' => Hash::make('password'),
    ]);

    $token = $this->postJson('/api/auth/login', [
        'email' => 'maria@example.com',
        'password' => 'password',
    ])->json('token');

    $this
        ->withToken($token)
        ->postJson('/api/auth/logout')
        ->assertNoContent();

    expect(PersonalAccessToken::count())->toBe(0);

    $this->app['auth']->forgetGuards();

    $this
        ->withToken($token)
        ->getJson('/api/auth/me')
        ->assertUnauthorized();
});

test('login rejects invalid credentials', function () {
    User::factory()->create([
        'email' => 'maria@example.com',
        'password' => Hash::make('password'),
    ]);

    $this->postJson('/api/auth/login', [
        'email' => 'maria@example.com',
        'password' => 'wrong-password',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});
