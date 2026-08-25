<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AnswerAnonymousQuestionRequest;
use App\Models\AnonymousQuestion;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class AnonymousQuestionController extends Controller
{
    public function index(Request $request, AccentInsensitiveSearchNormalizer $normalizer): JsonResponse
    {
        $this->ensureAllowed($request);

        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in([
                AnonymousQuestion::NEW,
                AnonymousQuestion::IN_REVIEW,
                AnonymousQuestion::ANSWERED,
                AnonymousQuestion::ARCHIVED,
            ])],
            'priority' => ['nullable', Rule::in([
                AnonymousQuestion::LOW_PRIORITY,
                AnonymousQuestion::MEDIUM_PRIORITY,
                AnonymousQuestion::HIGH_PRIORITY,
                AnonymousQuestion::URGENT_PRIORITY,
            ])],
        ]);

        $term = $normalizer->normalize((string) ($filters['q'] ?? ''));
        $questions = AnonymousQuestion::query()
            ->with(['answeredByUser:id,name', 'archivedByUser:id,name'])
            ->when($term !== '', fn (Builder $query) => $query->where('search_text_normalized', 'like', "%{$term}%"))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['priority'] ?? null, fn (Builder $query, string $priority) => $query->where('priority', $priority))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $questions->items(),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    public function show(Request $request, AnonymousQuestion $anonymousQuestion): JsonResponse
    {
        $this->ensureAllowed($request);

        return response()->json([
            'data' => $anonymousQuestion->load(['answeredByUser:id,name', 'archivedByUser:id,name']),
        ]);
    }

    public function answer(
        AnswerAnonymousQuestionRequest $request,
        AnonymousQuestion $anonymousQuestion,
    ): JsonResponse {
        abort_if(
            $anonymousQuestion->status === AnonymousQuestion::ARCHIVED,
            Response::HTTP_CONFLICT,
            'Uma pergunta arquivada não pode ser respondida.',
        );

        $anonymousQuestion->fill([
            ...$request->validated(),
            'status' => AnonymousQuestion::ANSWERED,
            'answered_by' => $request->user()->id,
            'answered_at' => now(),
        ])->save();

        return response()->json([
            'data' => $anonymousQuestion->fresh()->load(['answeredByUser:id,name', 'archivedByUser:id,name']),
        ]);
    }

    public function archive(Request $request, AnonymousQuestion $anonymousQuestion): JsonResponse
    {
        $this->ensureAllowed($request);

        if ($anonymousQuestion->status !== AnonymousQuestion::ARCHIVED) {
            $anonymousQuestion->forceFill([
                'status' => AnonymousQuestion::ARCHIVED,
                'archived_by' => $request->user()->id,
                'archived_at' => now(),
            ])->save();
        }

        return response()->json([
            'data' => $anonymousQuestion->fresh()->load(['answeredByUser:id,name', 'archivedByUser:id,name']),
        ]);
    }

    private function ensureAllowed(Request $request): void
    {
        abort_unless(
            $request->user()?->hasPermission('anonymous_questions.manage'),
            Response::HTTP_FORBIDDEN,
        );
    }
}
