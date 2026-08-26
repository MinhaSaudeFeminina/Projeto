<?php

namespace App\Services\Health;

use App\Models\Symptom;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Database\Eloquent\Builder;

class AdminSymptomSearchQuery
{
    public function __construct(private readonly AccentInsensitiveSearchNormalizer $normalizer) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Symptom>
     */
    public function query(array $filters = []): Builder
    {
        return Symptom::query()
            ->when($this->normalizedTerm($filters), function (Builder $query, string $term): void {
                $query->where('search_text_normalized', 'like', "%{$term}%");
            })
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when(array_key_exists('show_in_app', $filters), fn (Builder $query) => $query->where('show_in_app', $this->asBoolean($filters['show_in_app'])))
            ->when(array_key_exists('generate_ubs_alert', $filters), fn (Builder $query) => $query->where('is_alert_candidate', $this->asBoolean($filters['generate_ubs_alert'])))
            ->orderBy('sort_order')
            ->orderBy('name');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function normalizedTerm(array $filters): ?string
    {
        $term = $this->normalizer->normalize((string) ($filters['q'] ?? ''));

        return $term === '' ? null : $term;
    }

    private function asBoolean(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
