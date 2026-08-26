<?php

namespace App\Console\Commands;

use App\Models\EducationalContent;
use App\Services\Content\ContentTextPreparationService;
use Illuminate\Console\Command;

/**
 * Rebuilds `search_text_normalized` for every article. Needed whenever the
 * indexing rules change, since stored rows keep whatever text was current when
 * they were last saved.
 */
class ReindexContentSearch extends Command
{
    protected $signature = 'content:reindex';

    protected $description = 'Rebuild the search index of every educational content';

    public function handle(ContentTextPreparationService $textPreparation): int
    {
        $total = 0;

        EducationalContent::query()->chunkById(100, function ($contents) use ($textPreparation, &$total): void {
            foreach ($contents as $content) {
                $textPreparation->refreshSearchIndex($content);
                $total++;
            }
        });

        $this->info("Reindexed {$total} content(s).");

        return self::SUCCESS;
    }
}
