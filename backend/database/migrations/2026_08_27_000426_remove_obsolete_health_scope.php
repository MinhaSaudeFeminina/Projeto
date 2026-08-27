<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TOPIC_TERMS = [
        'gesta', 'gravid', 'puerp', 'pre-natal', 'pré-natal', 'pos-parto', 'pós-parto',
        'fertil', 'fértil', 'ovula', 'concepc', 'parto', 'obstetr', 'feto', 'fetal',
        'bebe', 'bebê', 'matern', 'amament', 'aleitamento', 'lacta', 'embria', 'embriã',
        'cesarea', 'cesárea', 'recem-nasc', 'recém-nasc', 'nascimento',
    ];

    public function up(): void
    {
        DB::transaction(function (): void {
            $lifeStageIds = $this->matchingIds('life_stages', ['key', 'name', 'description']);
            $categoryIds = $this->matchingIds('content_categories', ['slug', 'name', 'description']);
            $contentIds = $this->contentIds($lifeStageIds, $categoryIds);

            $this->deleteMatchingNotifications($contentIds);
            $this->deleteMatchingContentHistory($contentIds);
            $this->deleteMatchingAuditRecords($contentIds);
            $this->deleteMatchingSymptomData();

            if ($contentIds->isNotEmpty()) {
                DB::table('educational_contents')->whereIn('id', $contentIds)->delete();
            }

            if ($lifeStageIds->isNotEmpty()) {
                if (Schema::hasTable('user_profiles') && Schema::hasColumn('user_profiles', 'life_stage_id')) {
                    DB::table('user_profiles')->whereIn('life_stage_id', $lifeStageIds)->update(['life_stage_id' => null]);
                }

                DB::table('life_stages')->whereIn('id', $lifeStageIds)->delete();
            }

            if ($categoryIds->isNotEmpty()) {
                DB::table('content_categories')->whereIn('id', $categoryIds)->delete();
            }
        });
    }

    public function down(): void {}

    /**
     * @param  array<int, string>  $columns
     * @return Collection<int, int>
     */
    private function matchingIds(string $table, array $columns): Collection
    {
        if (! Schema::hasTable($table)) {
            return collect();
        }

        $availableColumns = array_values(array_filter(
            $columns,
            fn (string $column): bool => Schema::hasColumn($table, $column),
        ));

        if ($availableColumns === []) {
            return collect();
        }

        $query = DB::table($table);
        $this->whereTopicAppears($query, $availableColumns);

        return $query->pluck('id')->map(fn (mixed $id): int => (int) $id);
    }

    /**
     * @param  Collection<int, int>  $lifeStageIds
     * @param  Collection<int, int>  $categoryIds
     * @return Collection<int, int>
     */
    private function contentIds(Collection $lifeStageIds, Collection $categoryIds): Collection
    {
        if (! Schema::hasTable('educational_contents')) {
            return collect();
        }

        $contentIds = collect();

        if ($lifeStageIds->isNotEmpty() && Schema::hasTable('content_life_stage')) {
            $contentIds = $contentIds->merge(
                DB::table('content_life_stage')->whereIn('life_stage_id', $lifeStageIds)->pluck('educational_content_id'),
            );
        }

        if ($lifeStageIds->isNotEmpty() && Schema::hasColumn('educational_contents', 'life_stage_id')) {
            $contentIds = $contentIds->merge(
                DB::table('educational_contents')->whereIn('life_stage_id', $lifeStageIds)->pluck('id'),
            );
        }

        if ($categoryIds->isNotEmpty()) {
            $contentIds = $contentIds->merge(
                DB::table('educational_contents')->whereIn('category_id', $categoryIds)->pluck('id'),
            );
        }

        $textQuery = DB::table('educational_contents');
        $this->whereTopicAppears($textQuery, ['title', 'slug', 'summary', 'body', 'search_text_normalized']);

        return $contentIds
            ->merge($textQuery->pluck('id'))
            ->map(fn (mixed $id): int => (int) $id)
            ->unique()
            ->values();
    }

    /**
     * @param  Collection<int, int>  $contentIds
     */
    private function deleteMatchingNotifications(Collection $contentIds): void
    {
        if (! Schema::hasTable('admin_notifications')) {
            return;
        }

        $query = DB::table('admin_notifications')->where(function (Builder $notificationQuery) use ($contentIds): void {
            if ($contentIds->isNotEmpty()) {
                $notificationQuery->whereIn('content_id', $contentIds);
            }

            $this->orWhereTopicAppears($notificationQuery, ['title', 'message', 'action_url']);
        });
        $query->delete();
    }

    /**
     * @param  Collection<int, int>  $contentIds
     */
    private function deleteMatchingContentHistory(Collection $contentIds): void
    {
        if (! Schema::hasTable('content_revisions')) {
            return;
        }

        $availableColumns = array_values(array_filter(
            [
                'title_snapshot', 'summary_snapshot', 'body_snapshot', 'category_snapshot',
                'life_stages_snapshot', 'change_summary',
            ],
            fn (string $column): bool => Schema::hasColumn('content_revisions', $column),
        ));
        $query = DB::table('content_revisions')->where(function (Builder $revisionQuery) use ($contentIds, $availableColumns): void {
            if ($contentIds->isNotEmpty()) {
                $revisionQuery->whereIn('content_id', $contentIds);
            }

            $this->orWhereTopicAppears($revisionQuery, $availableColumns);
        });
        $query->delete();
    }

    /**
     * @param  Collection<int, int>  $contentIds
     */
    private function deleteMatchingAuditRecords(Collection $contentIds): void
    {
        if (Schema::hasTable('editorial_audit_events')) {
            $query = DB::table('editorial_audit_events')->where(function (Builder $auditQuery) use ($contentIds): void {
                if ($contentIds->isNotEmpty()) {
                    $auditQuery->whereIn('content_id', $contentIds);
                }

                $this->orWhereTopicAppears($auditQuery, ['comment', 'metadata']);
            });
            $query->delete();
        }

        if (Schema::hasTable('audit_events')) {
            $query = DB::table('audit_events');
            $this->whereTopicAppears($query, ['previous_state', 'new_state', 'metadata_minimal']);
            $query->delete();
        }
    }

    private function deleteMatchingSymptomData(): void
    {
        $symptomIds = $this->matchingIds('symptoms', [
            'name', 'type', 'short_description', 'description', 'category',
            'orientation_text', 'severity_alert_text', 'search_text_normalized',
        ]);

        if (Schema::hasTable('symptom_records')) {
            $availableColumns = array_values(array_filter(
                ['custom_symptom', 'notes'],
                fn (string $column): bool => Schema::hasColumn('symptom_records', $column),
            ));
            $query = DB::table('symptom_records')->where(function (Builder $recordQuery) use ($symptomIds, $availableColumns): void {
                if ($symptomIds->isNotEmpty()) {
                    $recordQuery->whereIn('symptom_id', $symptomIds);
                }

                $this->orWhereTopicAppears($recordQuery, $availableColumns);
            });
            $query->delete();
        }

        if ($symptomIds->isNotEmpty()) {
            DB::table('symptoms')->whereIn('id', $symptomIds)->delete();
        }
    }

    /**
     * @param  array<int, string>  $columns
     */
    private function whereTopicAppears(Builder $query, array $columns): void
    {
        $query->where(function (Builder $nestedQuery) use ($columns): void {
            $this->orWhereTopicAppears($nestedQuery, $columns);
        });
    }

    /**
     * @param  array<int, string>  $columns
     */
    private function orWhereTopicAppears(Builder $query, array $columns): void
    {
        foreach ($columns as $column) {
            foreach (self::TOPIC_TERMS as $term) {
                $query->orWhere($column, 'like', "%{$term}%");
            }
        }
    }
};
