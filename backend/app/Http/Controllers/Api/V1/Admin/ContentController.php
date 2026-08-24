<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContentRequest;
use App\Http\Requests\Admin\UpdateContentRequest;
use App\Models\EducationalContent;
use App\Services\Audit\AuditRecorder;
use App\Services\Content\AccentInsensitiveSearchNormalizer;
use App\Services\Content\ContentRevisionRecorder;
use App\Services\Content\ContentTextPreparationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ContentController extends Controller
{
    public function index(Request $request, AccentInsensitiveSearchNormalizer $normalizer): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        $contents = EducationalContent::query()
            ->with(['category', 'lifeStages', 'ageRanges', 'author:id,name'])
            ->when($request->filled('q'), function ($query) use ($request, $normalizer): void {
                $query->where('search_text_normalized', 'like', '%'.$normalizer->normalize($request->string('q')->toString()).'%');
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('author_id'), fn ($query) => $query->where('author_id', $request->integer('author_id')))
            ->latest('updated_at')
            ->paginate(20);

        return response()->json([
            'data' => $contents->items(),
            'meta' => [
                'current_page' => $contents->currentPage(),
                'last_page' => $contents->lastPage(),
                'total' => $contents->total(),
            ],
        ]);
    }

    public function store(
        StoreContentRequest $request,
        ContentTextPreparationService $textPreparation,
        ContentRevisionRecorder $revisions,
        AuditRecorder $audit,
    ): JsonResponse {
        $content = DB::transaction(function () use ($request, $textPreparation, $revisions, $audit): EducationalContent {
            $data = $request->validated();
            $lifeStageIds = Arr::pull($data, 'life_stage_ids', []);
            $ageRangeIds = Arr::pull($data, 'age_range_ids', []);

            $content = EducationalContent::create([
                ...$data,
                'slug' => $textPreparation->uniqueSlug($data['title']),
                'status' => EducationalContent::DRAFT,
                'author_id' => $request->user()->id,
            ]);
            $content->lifeStages()->sync($lifeStageIds);
            $content->ageRanges()->sync($ageRangeIds);
            $content->load(['category', 'lifeStages', 'ageRanges', 'author:id,name']);
            $content->update(['search_text_normalized' => $textPreparation->searchableText($content)]);

            $revisions->record($content, $request->user(), 'Conteúdo criado');
            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'content_created',
                content: $content,
                newStatus: EducationalContent::DRAFT,
                metadata: ['fields' => ['title', 'summary', 'body', 'category_id', 'life_stage_ids', 'age_range_ids']],
            );

            return $content;
        });

        return response()->json(['data' => $content->fresh()->load(['category', 'lifeStages', 'ageRanges', 'author:id,name'])], 201);
    }

    public function show(EducationalContent $content): JsonResponse
    {
        $this->authorize('view', $content);

        return response()->json(['data' => $content->load(['category', 'lifeStages', 'ageRanges', 'author:id,name'])]);
    }

    public function update(
        UpdateContentRequest $request,
        EducationalContent $content,
        ContentTextPreparationService $textPreparation,
        ContentRevisionRecorder $revisions,
        AuditRecorder $audit,
    ): JsonResponse {
        $content = DB::transaction(function () use ($request, $content, $textPreparation, $revisions, $audit): EducationalContent {
            $data = $request->validated();
            $lifeStageIds = Arr::pull($data, 'life_stage_ids');
            $ageRangeIds = Arr::pull($data, 'age_range_ids');

            if (array_key_exists('title', $data)) {
                $data['slug'] = $textPreparation->uniqueSlug($data['title'], $content->id);
            }

            $content->fill($data)->save();

            if ($lifeStageIds !== null) {
                $content->lifeStages()->sync($lifeStageIds);
            }

            if ($ageRangeIds !== null) {
                $content->ageRanges()->sync($ageRangeIds);
            }

            $content->unsetRelation('lifeStages')->unsetRelation('ageRanges')->unsetRelation('category');
            $content->load(['category', 'lifeStages', 'ageRanges', 'author:id,name']);
            $content->update(['search_text_normalized' => $textPreparation->searchableText($content)]);

            $revisions->record($content, $request->user(), 'Conteúdo editado');
            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'content_updated',
                content: $content,
                previousStatus: $content->status,
                newStatus: $content->status,
                metadata: ['fields' => array_keys($request->validated())],
            );

            return $content;
        });

        return response()->json(['data' => $content->fresh()->load(['category', 'lifeStages', 'ageRanges', 'author:id,name'])]);
    }
}
