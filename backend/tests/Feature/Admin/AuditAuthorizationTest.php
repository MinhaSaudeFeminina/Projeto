<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows audit and history access according to editorial permissions', function (): void {
    $owner = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $otherAuthor = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Bem-estar', 'slug' => 'bem-estar']);
    $content = EducationalContent::create([
        'title' => 'Bem-estar feminino',
        'slug' => 'bem-estar-feminino',
        'summary' => 'Conteúdo educativo.',
        'body' => 'Orientações educativas.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $owner->id,
    ]);

    $this->getJson("/api/v1/admin/contents/{$content->id}/audit")->assertUnauthorized();
    $this->getJson("/api/v1/admin/contents/{$content->id}/revisions")->assertUnauthorized();

    foreach (['audit', 'revisions'] as $endpoint) {
        $this->actingAs($owner, 'sanctum')->getJson("/api/v1/admin/contents/{$content->id}/{$endpoint}")->assertOk();
        $this->actingAs($otherAuthor, 'sanctum')->getJson("/api/v1/admin/contents/{$content->id}/{$endpoint}")->assertForbidden();
        $this->actingAs($reviewer, 'sanctum')->getJson("/api/v1/admin/contents/{$content->id}/{$endpoint}")->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson("/api/v1/admin/contents/{$content->id}/{$endpoint}")->assertOk();
    }
});
