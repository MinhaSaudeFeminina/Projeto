<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ContentCategory;
use App\Models\Symptom;
use Illuminate\Http\JsonResponse;

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

    public function symptoms(): JsonResponse
    {
        return response()->json([
            'data' => Symptom::query()
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'is_alert_candidate']),
        ]);
    }
}
