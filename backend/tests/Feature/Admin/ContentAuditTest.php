<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('content creation records audit and revision', function () {
    [, $token] = adminWithRoleForEditorial(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);

    $id = $this->withToken($token)->postJson('/api/v1/admin/contents', [
        'title' => 'Prevenção e saúde',
        'summary' => 'Resumo com acentuação.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
    ])->assertCreated()->json('data.id');

    $this->assertDatabaseHas('audit_events', ['target_id' => $id, 'action' => 'created']);
    $this->assertDatabaseHas('content_revisions', ['content_id' => $id, 'status' => 'Rascunho']);
});
