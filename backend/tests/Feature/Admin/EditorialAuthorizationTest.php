<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('reviewer cannot publish approved content', function () {
    [$author] = adminWithRoleForEditorial(AdminRole::AUTHOR);
    [, $reviewerToken] = adminWithRoleForEditorial(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Vacinas', 'slug' => 'vacinas']);
    $content = EducationalContent::create([
        'title' => 'Vacinas e prevenção',
        'slug' => 'vacinas-e-prevencao',
        'summary' => 'Resumo.',
        'body' => 'Corpo.',
        'category_id' => $category->id,
        'status' => EducationalContent::APPROVED,
        'author_id' => $author->id,
        'approved_by' => $author->id,
        'approved_at' => now(),
    ]);

    $this->withToken($reviewerToken)
        ->postJson("/api/v1/admin/contents/{$content->id}/actions", ['action' => 'publish'])
        ->assertForbidden();
});
