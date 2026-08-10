<?php

use App\Models\AdminRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

it('blocks unauthenticated and inactive users from admin routes', function (): void {
    Route::middleware(['auth:sanctum', 'admin.role'])->get('/api/teste-admin-protegido', fn () => response()->json(['ok' => true]));

    $this->getJson('/api/teste-admin-protegido')->assertUnauthorized();

    $inactive = User::factory()->create([
        'user_type' => 'admin_user',
        'is_active' => false,
    ]);

    $this->actingAs($inactive, 'sanctum')
        ->getJson('/api/teste-admin-protegido')
        ->assertForbidden();
});

it('allows only required administrative roles', function (): void {
    Route::middleware(['auth:sanctum', 'admin.role:admin'])->get('/api/teste-admin-role', fn () => response()->json(['ok' => true]));

    $authorRole = AdminRole::create(['key' => AdminRole::AUTHOR, 'name' => 'Acadêmica/autora']);
    $adminRole = AdminRole::create(['key' => AdminRole::ADMIN, 'name' => 'Admin']);

    $author = User::factory()->create(['user_type' => 'admin_user', 'is_active' => true]);
    $author->adminRoles()->attach($authorRole->id);

    $admin = User::factory()->create(['user_type' => 'admin_user', 'is_active' => true]);
    $admin->adminRoles()->attach($adminRole->id);

    $this->actingAs($author, 'sanctum')->getJson('/api/teste-admin-role')->assertForbidden();
    $this->actingAs($admin, 'sanctum')->getJson('/api/teste-admin-role')->assertOk();
});
