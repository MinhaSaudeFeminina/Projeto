<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSymptomRequest;
use App\Http\Requests\Admin\UpdateSymptomRequest;
use App\Http\Resources\Admin\SymptomResource;
use App\Models\Symptom;
use App\Services\Audit\AuditRecorder;
use App\Services\Health\AdminSymptomSearchQuery;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SymptomController extends Controller
{
    public function index(Request $request, AdminSymptomSearchQuery $search): JsonResponse
    {
        $this->authorize('viewAny', Symptom::class);

        $filters = $request->validate([
            'q' => ['sometimes', 'nullable', 'string', 'max:120'],
            'type' => ['sometimes', 'nullable', 'string', 'max:60'],
            'category' => ['sometimes', 'nullable', 'string', 'max:120'],
            'show_in_app' => ['sometimes', 'boolean'],
            'generate_ubs_alert' => ['sometimes', 'boolean'],
        ]);

        return response()->json([
            'data' => SymptomResource::collection($search->query($filters)->get()),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function show(Symptom $symptom): JsonResponse
    {
        $this->authorize('view', $symptom);

        return response()->json([
            'data' => new SymptomResource($symptom),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function store(
        StoreSymptomRequest $request,
        AccentInsensitiveSearchNormalizer $normalizer,
        AuditRecorder $audit,
    ): JsonResponse {
        $symptom = DB::transaction(function () use ($request, $normalizer, $audit): Symptom {
            $symptom = Symptom::create($this->persistenceData(
                $request->validated(),
                $normalizer,
                createdBy: $request->user()->id,
                updatedBy: $request->user()->id,
            ));

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'symptom_created',
                metadata: ['symptom_id' => $symptom->id, 'name' => $symptom->name],
            );

            return $symptom;
        });

        return response()->json([
            'message' => 'Sintoma ou queixa criado com sucesso.',
            'data' => new SymptomResource($symptom),
        ], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function update(
        UpdateSymptomRequest $request,
        Symptom $symptom,
        AccentInsensitiveSearchNormalizer $normalizer,
        AuditRecorder $audit,
    ): JsonResponse {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $symptom, $validated, $normalizer, $audit): void {
            $symptom->fill($this->persistenceData(
                $validated,
                $normalizer,
                existing: $symptom,
                updatedBy: $request->user()->id,
            ));
            $symptom->save();

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'symptom_updated',
                metadata: [
                    'symptom_id' => $symptom->id,
                    'name' => $symptom->name,
                    'changed_fields' => array_keys($validated),
                ],
            );
        });

        return response()->json([
            'message' => 'Sintoma ou queixa atualizado com sucesso.',
            'data' => new SymptomResource($symptom->refresh()),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function destroy(Request $request, Symptom $symptom, AuditRecorder $audit): Response|JsonResponse
    {
        $this->authorize('delete', $symptom);

        if ($symptom->records()->exists()) {
            return response()->json([
                'message' => 'Este item possui registros associados. Desative sua exibição em vez de excluí-lo.',
            ], 422, [], JSON_UNESCAPED_UNICODE);
        }

        DB::transaction(function () use ($request, $symptom, $audit): void {
            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'symptom_deleted',
                metadata: ['symptom_id' => $symptom->id, 'name' => $symptom->name],
            );
            $symptom->delete();
        });

        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function persistenceData(
        array $validated,
        AccentInsensitiveSearchNormalizer $normalizer,
        ?Symptom $existing = null,
        ?int $createdBy = null,
        ?int $updatedBy = null,
    ): array {
        $data = $validated;

        if (array_key_exists('full_description', $data)) {
            $data['description'] = $data['full_description'];
            unset($data['full_description']);
        }

        if (array_key_exists('generate_ubs_alert', $data)) {
            $data['is_alert_candidate'] = $data['generate_ubs_alert'];
            unset($data['generate_ubs_alert']);
        }

        if ($createdBy !== null) {
            $data['created_by'] = $createdBy;
        }

        if ($updatedBy !== null) {
            $data['updated_by'] = $updatedBy;
        }

        $searchable = [
            $data['name'] ?? $existing?->name,
            $data['type'] ?? $existing?->type,
            $data['short_description'] ?? $existing?->short_description,
            $data['description'] ?? $existing?->description,
            $data['category'] ?? $existing?->category,
        ];
        $data['search_text_normalized'] = $normalizer->normalize(implode(' ', array_filter($searchable)));

        return $data;
    }
}
