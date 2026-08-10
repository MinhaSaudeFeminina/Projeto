<?php

namespace App\Services\Content;

use App\Models\ContentRevision;
use App\Models\EducationalContent;
use App\Models\User;

class ContentRevisionRecorder
{
    public function record(EducationalContent $content, User $actor, ?string $summary = null): ContentRevision
    {
        $version = ((int) $content->revisions()->max('version')) + 1;

        return ContentRevision::create([
            'content_id' => $content->id,
            'changed_by' => $actor->id,
            'version' => $version,
            'title_snapshot' => $content->title,
            'summary_snapshot' => $content->summary,
            'body_snapshot' => $content->body,
            'category_snapshot' => $content->category ? $content->category->only(['id', 'name', 'slug']) : null,
            'life_stages_snapshot' => $content->relationLoaded('lifeStages') ? $content->lifeStages->pluck('name')->all() : null,
            'age_ranges_snapshot' => $content->relationLoaded('ageRanges') ? $content->ageRanges->pluck('label')->all() : null,
            'status_snapshot' => $content->status,
            'change_summary' => $summary,
            'created_at' => now(),
        ]);
    }
}
