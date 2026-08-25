<?php

namespace App\Services\Content;

use App\Models\EducationalContent;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Database\Eloquent\Builder;

class AdminContentSearchQuery
{
    public function __construct(private readonly AccentInsensitiveSearchNormalizer $normalizer) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<EducationalContent>
     */
    public function query(array $filters = []): Builder
    {
        return EducationalContent::query()
            ->with(['category', 'lifeStages', 'ageRanges', 'author:id,name'])
            ->when($this->normalizedTerm($filters), function (Builder $query, string $term): void {
                $query->where('search_text_normalized', 'like', "%{$term}%");
            })
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['category_id'] ?? null, fn (Builder $query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['life_stage_id'] ?? null, function (Builder $query, int $lifeStageId): void {
                $query->whereHas('lifeStages', fn (Builder $lifeStages) => $lifeStages->whereKey($lifeStageId));
            })
            ->when($filters['age_range_id'] ?? null, function (Builder $query, int $ageRangeId): void {
                $query->whereHas('ageRanges', fn (Builder $ageRanges) => $ageRanges->whereKey($ageRangeId));
            })
            ->when($filters['author_id'] ?? null, fn (Builder $query, int $authorId) => $query->where('author_id', $authorId))
            ->latest('updated_at');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function normalizedTerm(array $filters): ?string
    {
        $term = $this->normalizer->normalize((string) ($filters['q'] ?? ''));

        return $term === '' ? null : $term;
    }
}
