<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use Illuminate\Http\JsonResponse;

class TaxonomyController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        return response()->json(['data' => [
            'categories' => $this->activeCategories(),
            'life_stages' => $this->activeLifeStages(),
            'age_ranges' => $this->activeAgeRanges(),
        ]]);
    }

    public function categories(): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        return response()->json(['data' => $this->activeCategories()]);
    }

    public function lifeStages(): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        return response()->json(['data' => $this->activeLifeStages()]);
    }

    public function ageRanges(): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        return response()->json(['data' => $this->activeAgeRanges()]);
    }

    private function activeCategories(): array
    {
        return ContentCategory::query()->where('is_active', true)->orderBy('name')->get()->all();
    }

    private function activeLifeStages(): array
    {
        return LifeStage::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get()->all();
    }

    private function activeAgeRanges(): array
    {
        return AgeRange::query()->where('is_active', true)->orderBy('sort_order')->orderBy('min_age')->get()->all();
    }
}
