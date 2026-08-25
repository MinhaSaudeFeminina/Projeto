<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin dashboard returns editorial counters', function () {
    [$admin, $token] = adminWithRoleForEditorial(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar']);
    EducationalContent::create([
        'title' => 'Bem-estar',
        'slug' => 'bem-estar',
        'summary' => 'Resumo.',
        'body' => 'Corpo.',
        'category_id' => $category->id,
        'status' => EducationalContent::PUBLISHED,
        'author_id' => $admin->id,
    ]);

    $this->withToken($token)->getJson('/api/v1/admin/dashboard')
        ->assertOk()
        ->assertJsonPath('data.published', 1);
});
