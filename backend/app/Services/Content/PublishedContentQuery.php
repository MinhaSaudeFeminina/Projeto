<?php

namespace App\Services\Content;

use App\Models\EducationalContent;
use Illuminate\Database\Eloquent\Builder;

class PublishedContentQuery
{
    public function __construct(private readonly AccentInsensitiveSearchNormalizer $normalizer)
    {
    }

    public function query(array $filters = []): Builder
    {
        $query = EducationalContent::query()
            ->with('category')
            ->where('status', EducationalContent::PUBLISHED)
            ->whereNull('archived_at')
            ->latest('published_at');

        if (! empty($filters['q'])) {
            $term = $this->normalizer->normalize((string) $filters['q']);
            $query->where('search_text_normalized', 'like', "%{$term}%");
        }

        if (! empty($filters['category'])) {
            $query->whereHas('category', fn ($category) => $category->where('slug', $filters['category']));
        }

        if (! empty($filters['life_stage'])) {
            $query->where('life_stage_id', $filters['life_stage']);
        }

        if (! empty($filters['age_range'])) {
            $query->where('age_range_id', $filters['age_range']);
        }

        return $query;
    }
}
