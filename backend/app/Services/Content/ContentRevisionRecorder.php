<?php

namespace App\Services\Content;

use App\Models\ContentRevision;
use App\Models\EducationalContent;
use App\Models\User;

class ContentRevisionRecorder
{
    public function record(EducationalContent $content, User $actor, ?string $summary = null): ContentRevision
    {
        $content->loadMissing(['category', 'lifeStages', 'ageRanges']);
        $version = ((int) $content->revisions()->max('version')) + 1;

        return ContentRevision::create([
            'content_id' => $content->id,
            'changed_by' => $actor->id,
            'version' => $version,
            'title_snapshot' => $content->title,
            'summary_snapshot' => $content->summary,
            'body_snapshot' => $content->body,
            'category_snapshot' => $content->category ? $content->category->only(['id', 'name', 'slug']) : null,
            'life_stages_snapshot' => $content->lifeStages->map->only(['id', 'key', 'name'])->all(),
            'age_ranges_snapshot' => $content->ageRanges->map->only(['id', 'label'])->all(),
            'status_snapshot' => $content->status,
            'change_summary' => $summary,
            'title' => $content->title,
            'summary' => $content->summary,
            'body' => $content->body,
            'status' => $content->status,
            'change_note' => $summary,
            'created_at' => now(),
        ]);
    }
}
