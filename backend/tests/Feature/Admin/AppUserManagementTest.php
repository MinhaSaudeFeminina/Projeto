<?php

use App\Models\AdminRole;
use App\Models\AgeRange;
use App\Models\LifeStage;
use App\Models\User;
use Database\Seeders\AdminRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function actingAdminForAppUserManagement(): User
{
    (new AdminRolePermissionSeeder())->run();

    $admin = User::factory()->create([
        'email' => 'app-users-admin@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'admin_user',
        'is_active' => true,
    ]);

    $adminRole = AdminRole::where('key', AdminRole::ADMIN)->firstOrFail();
    $admin->adminRoles()->attach($adminRole);

    return $admin;
}

it('lists mobile app users without exposing passwords', function (): void {
    $admin = actingAdminForAppUserManagement();
    $lifeStage = LifeStage::create(['key' => 'fase_adulta', 'name' => 'Fase adulta', 'is_active' => true]);
    $user = User::factory()->create([
        'name' => 'Maria Saúde',
        'email' => 'maria.saude@example.com',
        'user_type' => 'mobile_user',
        'is_active' => true,
    ]);
    $user->profile()->create([
        'birth_date' => now()->subYears(28)->toDateString(),
        'calculated_age' => 28,
        'life_stage_id' => $lifeStage->id,
        'privacy_settings' => ['push_discreet' => true],
    ]);

    $this
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/app-users')
        ->assertOk()
        ->assertJsonFragment([
            'name' => 'Maria Saúde',
            'email' => 'maria.saude@example.com',
            'life_stage' => 'Fase adulta',
            'is_active' => true,
            'notifications_active' => true,
        ])
        ->assertJsonMissingPath('0.password');
});

it('allows admin to edit and deactivate a mobile app user', function (): void {
    $admin = actingAdminForAppUserManagement();
    AgeRange::create(['label' => '30-39', 'min_age' => 30, 'max_age' => 39]);
    $lifeStage = LifeStage::create(['key' => 'tentando_engravidar', 'name' => 'Tentando engravidar', 'is_active' => true]);
    $user = User::factory()->create([
        'name' => 'Maria Saúde',
        'email' => 'maria.saude@example.com',
        'user_type' => 'mobile_user',
        'is_active' => true,
    ]);
    $user->profile()->create([
        'birth_date' => now()->subYears(28)->toDateString(),
        'calculated_age' => 28,
        'privacy_settings' => ['push_discreet' => true],
    ]);

    $this
        ->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/app-users/{$user->id}", [
            'name' => 'Maria Eduarda',
            'email' => 'maria.eduarda@example.com',
            'birth_date' => now()->subYears(35)->toDateString(),
            'life_stage_id' => $lifeStage->id,
            'notifications_active' => false,
            'is_active' => false,
        ])
        ->assertOk()
        ->assertJsonFragment([
            'name' => 'Maria Eduarda',
            'email' => 'maria.eduarda@example.com',
            'life_stage' => 'Tentando engravidar',
            'is_active' => false,
            'notifications_active' => false,
        ]);

    $user->refresh();

    expect($user->name)->toBe('Maria Eduarda')
        ->and($user->email)->toBe('maria.eduarda@example.com')
        ->and($user->is_active)->toBeFalse()
        ->and($user->profile->life_stage_id)->toBe($lifeStage->id)
        ->and($user->profile->privacy_settings['push_discreet'])->toBeFalse();
});
