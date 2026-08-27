<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLifeStageRequest;
use App\Http\Requests\Admin\SyncLifeStageContentsRequest;
use App\Http\Requests\Admin\UpdateLifeStageRequest;
use App\Models\LifeStage;
use App\Services\Audit\AuditRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LifeStageController extends Controller
{
    /** Colunas que a trilha expõe da faixa etária, sem arrastar a taxonomia inteira. */
    private const AGE_RANGE_COLUMNS = 'ageRange:id,label,min_age,max_age';

    /**
     * Por padrão devolve apenas as fases ativas, que é o que os seletores de
     * taxonomia esperam. A tela de trilhas pede `include_inactive` para poder
     * exibir e editar também as fases ainda em rascunho.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', LifeStage::class);

        $lifeStages = LifeStage::query()
            ->with(self::AGE_RANGE_COLUMNS)
            ->withCount('contents')
            ->unless($request->boolean('include_inactive'), fn ($query) => $query->where('is_active', true))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('age_range_id'), fn ($query) => $query->where('age_range_id', $request->integer('age_range_id')))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $lifeStages], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function show(LifeStage $lifeStage): JsonResponse
    {
        $this->authorize('view', $lifeStage);

        return response()->json(['data' => $this->withRelations($lifeStage)], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function store(StoreLifeStageRequest $request, AuditRecorder $audit): JsonResponse
    {
        $lifeStage = DB::transaction(function () use ($request, $audit): LifeStage {
            $data = $request->validated();

            $lifeStage = LifeStage::create([
                ...$data,
                'key' => $this->uniqueKeyFor((string) $data['name']),
                // Toda trilha nasce em rascunho: só a publicação a leva ao app.
                'status' => LifeStage::DRAFT,
            ]);

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'life_stage_created',
                newStatus: $lifeStage->status,
                metadata: ['life_stage_id' => $lifeStage->id, 'name' => $lifeStage->name],
            );

            return $lifeStage;
        });

        return response()->json([
            'message' => 'Trilha criada em rascunho.',
            'data' => $this->withRelations($lifeStage),
        ], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function update(UpdateLifeStageRequest $request, LifeStage $lifeStage, AuditRecorder $audit): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $lifeStage, $validated, $audit): void {
            $lifeStage->fill($validated)->save();

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'life_stage_updated',
                metadata: [
                    'life_stage_id' => $lifeStage->id,
                    'name' => $lifeStage->name,
                    'changed_fields' => array_keys($validated),
                ],
            );
        });

        return response()->json(['data' => $this->withRelations($lifeStage)], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Substitui a lista inteira: a posição de cada id no array vira a ordem em
     * que a usuária percorre a trilha.
     */
    public function syncContents(SyncLifeStageContentsRequest $request, LifeStage $lifeStage, AuditRecorder $audit): JsonResponse
    {
        $contentIds = array_values($request->validated('content_ids'));

        DB::transaction(function () use ($request, $lifeStage, $contentIds, $audit): void {
            $lifeStage->contents()->sync(
                collect($contentIds)
                    ->mapWithKeys(fn (int $id, int $position) => [$id => ['sort_order' => $position]])
                    ->all()
            );

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'life_stage_contents_synced',
                metadata: ['life_stage_id' => $lifeStage->id, 'content_ids' => $contentIds],
            );
        });

        return response()->json(['data' => $this->withRelations($lifeStage)], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /** Publicar é o que leva a trilha ao app, e exige admin ou professor/revisor. */
    public function publish(Request $request, LifeStage $lifeStage, AuditRecorder $audit): JsonResponse
    {
        $this->authorize('publish', $lifeStage);

        if ($lifeStage->age_range_id === null) {
            return response()->json([
                'message' => 'Defina a faixa etária da trilha antes de publicá-la.',
            ], 422, [], JSON_UNESCAPED_UNICODE);
        }

        $previousStatus = $lifeStage->status;

        DB::transaction(function () use ($request, $lifeStage, $previousStatus, $audit): void {
            $lifeStage->forceFill([
                'status' => LifeStage::PUBLISHED,
                'published_by' => $request->user()->id,
                'published_at' => now(),
                'is_active' => true,
            ])->save();

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'life_stage_published',
                previousStatus: $previousStatus,
                newStatus: $lifeStage->status,
                metadata: ['life_stage_id' => $lifeStage->id, 'name' => $lifeStage->name],
            );
        });

        return response()->json([
            'message' => 'Trilha publicada.',
            'data' => $this->withRelations($lifeStage),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function archive(Request $request, LifeStage $lifeStage, AuditRecorder $audit): JsonResponse
    {
        $this->authorize('archive', $lifeStage);

        $previousStatus = $lifeStage->status;

        DB::transaction(function () use ($request, $lifeStage, $previousStatus, $audit): void {
            $lifeStage->forceFill([
                'status' => LifeStage::ARCHIVED,
                'is_active' => false,
            ])->save();

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'life_stage_archived',
                previousStatus: $previousStatus,
                newStatus: $lifeStage->status,
                metadata: ['life_stage_id' => $lifeStage->id, 'name' => $lifeStage->name],
            );
        });

        return response()->json([
            'message' => 'Trilha arquivada.',
            'data' => $this->withRelations($lifeStage),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function destroy(Request $request, LifeStage $lifeStage, AuditRecorder $audit): Response|JsonResponse
    {
        $this->authorize('delete', $lifeStage);

        if ($lifeStage->contents()->exists()) {
            return response()->json([
                'message' => 'Desvincule os conteúdos antes de excluir a trilha.',
            ], 422, [], JSON_UNESCAPED_UNICODE);
        }

        DB::transaction(function () use ($request, $lifeStage, $audit): void {
            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'life_stage_deleted',
                previousStatus: $lifeStage->status,
                metadata: ['life_stage_id' => $lifeStage->id, 'name' => $lifeStage->name],
            );

            $lifeStage->delete();
        });

        return response()->noContent();
    }

    private function withRelations(LifeStage $lifeStage): LifeStage
    {
        return $lifeStage->refresh()
            ->load([self::AGE_RANGE_COLUMNS, 'contents:id,title,slug,status'])
            ->loadCount('contents');
    }

    /**
     * A `key` acompanha a trilha no app e nos conteúdos, então é derivada do
     * nome uma única vez e com sufixo quando já existir.
     */
    private function uniqueKeyFor(string $name): string
    {
        $base = Str::slug($name, '_') ?: 'trilha';
        $key = $base;
        $suffix = 2;

        while (LifeStage::query()->where('key', $key)->exists()) {
            $key = "{$base}_{$suffix}";
            $suffix++;
        }

        return $key;
    }
}
