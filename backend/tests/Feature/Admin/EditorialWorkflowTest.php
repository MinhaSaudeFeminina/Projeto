<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('content moves through editorial workflow with audit', function () {
    [$author, $authorToken] = adminWithRoleForEditorial(AdminRole::AUTHOR);
    [, $reviewerToken] = adminWithRoleForEditorial(AdminRole::REVIEWER);
    [$admin, $adminToken] = adminWithRoleForEditorial(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Ciclo menstrual', 'slug' => 'ciclo-menstrual']);

    $contentId = $this->withToken($authorToken)->postJson('/api/v1/admin/contents', [
        'title' => 'Saúde íntima e menstruação',
        'summary' => 'Conteúdo com acentuação correta.',
        'body' => 'Procure atendimento profissional em sinais de alerta.',
        'category_id' => $category->id,
    ])->assertCreated()->json('data.id');

    $this->withToken($authorToken)->postJson("/api/v1/admin/contents/{$contentId}/actions", ['action' => 'submit'])
        ->assertOk()->assertJsonPath('data.status', EducationalContent::IN_REVIEW);

    $this->withToken($reviewerToken)->postJson("/api/v1/admin/contents/{$contentId}/actions", ['action' => 'approve'])
        ->assertOk()->assertJsonPath('data.status', EducationalContent::APPROVED);

    expect($admin->adminRoles()->pluck('name')->all())->toContain(AdminRole::ADMIN);

    $this->withToken($adminToken)->postJson("/api/v1/admin/contents/{$contentId}/publish")
        ->assertOk()->assertJsonPath('data.status', EducationalContent::PUBLISHED);

    $this->withToken($adminToken)->postJson("/api/v1/admin/contents/{$contentId}/archive")
        ->assertOk()->assertJsonPath('data.status', EducationalContent::ARCHIVED);

    $this->withToken($adminToken)->getJson("/api/v1/admin/contents/{$contentId}/audit")
        ->assertOk()
        ->assertJsonFragment(['action' => 'published']);
});
