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
            $this->plainText($content->body),
            $content->category?->name,
            $content->lifeStages->pluck('name')->implode(' '),
            $content->ageRanges->pluck('label')->implode(' '),
        ])));
    }

    /**
     * The body is rich text; indexing it raw would make every article match a
     * search for "strong", "href" or any other tag or attribute name.
     */
    private function plainText(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }

        // Tags become spaces so adjacent blocks do not glue their words together.
        $text = preg_replace('/<[^>]*>/', ' ', $html) ?? '';

        return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public function refreshSearchIndex(EducationalContent $content): void
    {
        $content->forceFill([
            'search_text_normalized' => $this->searchableText($content),
        ])->saveQuietly();
    }
}
