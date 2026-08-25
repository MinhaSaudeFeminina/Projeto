<?php

namespace Database\Seeders;

use App\Models\AdminRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ContentTaxonomySeeder::class,
            AdminRolePermissionSeeder::class,
            AnonymousQuestionSeeder::class,
        ]);

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_type' => 'admin_user',
                'is_active' => true,
            ],
        );

        $role = AdminRole::where('key', AdminRole::ADMIN)->first();

        if ($role) {
            $admin->adminRoles()->syncWithoutDetaching([$role->id]);
        }
    }
}
