<?php

namespace Database\Seeders;

use App\Models\AdminRole;
use Illuminate\Database\Seeder;

class AdminRoleSeeder extends Seeder
{
    public function run(): void
    {
        AdminRole::updateOrCreate(['name' => AdminRole::AUTHOR], [
            'permissions' => ['content.create_own_draft', 'content.edit_own_draft', 'content.submit_own', 'content.publish'],
        ]);

        AdminRole::updateOrCreate(['name' => AdminRole::REVIEWER], [
            'permissions' => ['content.create', 'content.review', 'content.approve', 'content.publish', 'content.request_adjustments', 'content.reject'],
        ]);

        AdminRole::updateOrCreate(['name' => AdminRole::ADMIN], [
            'permissions' => ['*'],
        ]);
    }
}
