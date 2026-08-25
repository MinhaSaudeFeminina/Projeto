<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\ContentRevision;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('records ordered UTF-8 snapshots when a draft changes', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Climatério', 'slug' => 'climaterio']);

    $contentId = $this->actingAs($author, 'sanctum')->postJson('/api/v1/admin/contents', [
        'title' => 'Saúde no climatério',
        'summary' => 'Primeira versão.',
        'body' => 'Orientação inicial.',
        'category_id' => $category->id,
    ])->assertCreated()->json('data.id');

    $this->actingAs($author, 'sanctum')->patchJson("/api/v1/admin/contents/{$contentId}", [
        'summary' => 'Segunda versão com atenção à saúde.',
        'body' => 'Orientação revisada e acolhedora.',
    ])->assertOk();

    $revisions = ContentRevision::query()->where('content_id', $contentId)->orderBy('version')->get();

    expect($revisions)->toHaveCount(2)
        ->and($revisions[0]->version)->toBe(1)
        ->and($revisions[0]->summary_snapshot)->toBe('Primeira versão.')
        ->and($revisions[1]->version)->toBe(2)
        ->and($revisions[1]->summary_snapshot)->toBe('Segunda versão com atenção à saúde.');
});
