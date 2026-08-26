<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnonymousQuestion;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use App\Models\Symptom;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    private const PERIOD_DAYS = [
        '7d' => 7,
        '30d' => 30,
        '90d' => 90,
        '365d' => 365,
    ];

    public function show(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'period' => ['nullable', Rule::in(array_keys(self::PERIOD_DAYS))],
        ]);

        $period = $filters['period'] ?? '30d';
        $start = now()->subDays(self::PERIOD_DAYS[$period] - 1)->startOfDay();

        $contentsInPeriod = EducationalContent::query()->where('created_at', '>=', $start);
        $questionsInPeriod = AnonymousQuestion::query()->where('created_at', '>=', $start);
        $symptomsInPeriod = Symptom::query()->where('created_at', '>=', $start);

        return response()->json([
            'data' => [
                'period' => [
                    'key' => $period,
                    'start' => $start->toDateString(),
                    'end' => now()->toDateString(),
                ],
                'summary' => [
                    'contents_created' => (clone $contentsInPeriod)->count(),
                    'contents_published' => EducationalContent::query()
                        ->where('published_at', '>=', $start)
                        ->count(),
                    'questions_received' => (clone $questionsInPeriod)->count(),
                    'symptoms_created' => (clone $symptomsInPeriod)->count(),
                ],
                'content_statuses' => $this->contentStatuses($contentsInPeriod),
                'life_stages' => $this->lifeStages($start),
                'question_statuses' => $this->questionStatuses($questionsInPeriod),
                'symptom_categories' => $this->symptomCategories($symptomsInPeriod),
            ],
        ]);
    }

    private function contentStatuses(Builder $query): Collection
    {
        $counts = (clone $query)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return collect([
            EducationalContent::DRAFT => 'Rascunho',
            EducationalContent::IN_REVIEW => "Em revis\u{00E3}o",
            EducationalContent::APPROVED => 'Aprovado',
            EducationalContent::PUBLISHED => 'Publicado',
            EducationalContent::ARCHIVED => 'Arquivado',
        ])->map(fn (string $label, string $key) => [
            'key' => $key,
            'label' => $label,
            'value' => (int) ($counts[$key] ?? 0),
        ])->values();
    }

    private function lifeStages(CarbonInterface $start): Collection
    {
        return LifeStage::query()
            ->where('is_active', true)
            ->withCount(['contents' => fn (Builder $query) => $query->where('educational_contents.created_at', '>=', $start)])
            ->orderBy('sort_order')
            ->get()
            ->map(fn (LifeStage $lifeStage) => [
                'key' => $lifeStage->key,
                'label' => $lifeStage->name,
                'value' => (int) $lifeStage->contents_count,
            ]);
    }

    private function questionStatuses(Builder $query): Collection
    {
        $counts = (clone $query)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return collect([
            AnonymousQuestion::NEW => 'Nova',
            AnonymousQuestion::IN_REVIEW => "Em an\u{00E1}lise",
            AnonymousQuestion::ANSWERED => 'Respondida',
            AnonymousQuestion::ARCHIVED => 'Arquivada',
        ])->map(fn (string $label, string $key) => [
            'key' => $key,
            'label' => $label,
            'value' => (int) ($counts[$key] ?? 0),
        ])->values();
    }

    private function symptomCategories(Builder $query): Collection
    {
        return (clone $query)
            ->selectRaw('category, COUNT(*) as aggregate')
            ->groupBy('category')
            ->orderByDesc('aggregate')
            ->get()
            ->map(fn (Symptom $symptom) => [
                'key' => $symptom->category,
                'label' => $symptom->category,
                'value' => (int) $symptom->aggregate,
            ]);
    }
}
