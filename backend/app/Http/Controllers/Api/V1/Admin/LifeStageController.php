<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateLifeStageRequest;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LifeStageController extends Controller
{
    /**
     * Por padrão devolve apenas as fases ativas, que é o que os seletores de
     * taxonomia esperam. A tela de trilhas pede `include_inactive` para poder
     * exibir e editar também as fases ainda em rascunho.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        $lifeStages = LifeStage::query()
            ->withCount('contents')
            ->unless($request->boolean('include_inactive'), fn ($query) => $query->where('is_active', true))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $lifeStages], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function update(UpdateLifeStageRequest $request, LifeStage $lifeStage): JsonResponse
    {
        $lifeStage->fill($request->validated())->save();

        $lifeStage->loadCount('contents');

        return response()->json(['data' => $lifeStage], 200, [], JSON_UNESCAPED_UNICODE);
    }
}
