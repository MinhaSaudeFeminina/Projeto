<?php

namespace App\Services\Content;

use App\Models\EducationalContent;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Support\Str;

class ContentTextPreparationService
{
    public function __construct(private readonly AccentInsensitiveSearchNormalizer $normalizer) {}

    public function uniqueSlug(string $title, ?int $ignoreContentId = null): string
    {
        $base = Str::slug($title) ?: 'conteudo';
        $slug = $base;
        $suffix = 2;

        while (EducationalContent::query()
            ->when($ignoreContentId, fn ($query) => $query->whereKeyNot($ignoreContentId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    public function searchableText(EducationalContent $content): string
    {
        $content->loadMissing(['category', 'lifeStages', 'ageRanges']);

        return $this->normalizer->normalize(implode(' ', array_filter([
            $content->title,
            $content->summary,
            $content->body,
            $content->category?->name,
            $content->lifeStages->pluck('name')->implode(' '),
            $content->ageRanges->pluck('label')->implode(' '),
        ])));
    }

    public function refreshSearchIndex(EducationalContent $content): void
    {
        $content->forceFill([
            'search_text_normalized' => $this->searchableText($content),
        ])->saveQuietly();
    }
}
