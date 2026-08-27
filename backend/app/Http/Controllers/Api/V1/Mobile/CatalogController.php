<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use App\Models\Symptom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only lookup lists the app needs before it can send anything back:
 * category filters for the content list and the symptom picker options.
 */
class CatalogController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => ContentCategory::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description']),
        ]);
    }

    /**
     * Trilhas que já foram publicadas por um admin ou professor/revisor. Uma
     * trilha em rascunho ou arquivada não existe para o app, e mesmo dentro de
     * uma trilha publicada só aparecem conteúdos publicados.
     */
    public function lifeStages(Request $request): JsonResponse
    {
        $lifeStages = LifeStage::query()
            ->published()
            ->with([
                'ageRange:id,label,min_age,max_age',
                'contents' => fn ($query) => $query
                    ->where('educational_contents.status', EducationalContent::PUBLISHED)
                    ->select('educational_contents.id', 'title', 'slug', 'summary'),
            ])
            ->when(
                $request->filled('age_range_id'),
                fn ($query) => $query->where('age_range_id', $request->integer('age_range_id')),
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'key', 'name', 'description', 'ubs_orientation', 'warning_signals', 'reminder_suggestions', 'age_range_id', 'sort_order']);

        return response()->json(['data' => $lifeStages], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function symptoms(): JsonResponse
    {
        return response()->json([
            'data' => Symptom::query()
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'is_alert_candidate']),
        ]);
    }
}
