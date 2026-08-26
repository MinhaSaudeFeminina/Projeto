<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreReminderRequest;
use App\Http\Requests\Admin\UpdateReminderRequest;
use App\Models\AdminRole;
use App\Models\Reminder;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ReminderController extends Controller
{
    public function __construct(private readonly AccentInsensitiveSearchNormalizer $normalizer) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $reminders = Reminder::query()
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
            ->when($request->filled('q'), function ($query) use ($request): void {
                // Busca sobre o título já normalizado: ignora acento e caixa.
                $term = $this->normalizer->normalize($request->string('q')->toString());

                $query->where('title_normalized', 'like', "%{$term}%");
            })
            ->orderByDesc('is_active')
            ->orderBy('title')
            ->get();

        return response()->json(['data' => $reminders], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function store(StoreReminderRequest $request): JsonResponse
    {
        $reminder = Reminder::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $reminder], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function update(UpdateReminderRequest $request, Reminder $reminder): JsonResponse
    {
        $reminder->fill([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ])->save();

        return response()->json(['data' => $reminder->refresh()], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Duplica o lembrete como rascunho inativo, para a equipe ajustar a cópia
     * antes de publicá-la — evitar dois lembretes idênticos ativos ao mesmo tempo.
     */
    public function duplicate(Request $request, Reminder $reminder): JsonResponse
    {
        $this->authorizeAdmin($request);

        $copy = $reminder->replicate(['created_by', 'updated_by']);
        $copy->title = $this->copyTitle($reminder->title);
        $copy->is_active = false;
        $copy->created_by = $request->user()->id;
        $copy->updated_by = $request->user()->id;
        $copy->save();

        return response()->json(['data' => $copy], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function destroy(Request $request, Reminder $reminder): Response
    {
        $this->authorizeAdmin($request);

        $reminder->delete();

        return response()->noContent();
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->hasAdminRole(AdminRole::ADMIN), HttpResponse::HTTP_FORBIDDEN);
    }

    private function copyTitle(string $title): string
    {
        $candidate = mb_substr("{$title} (cópia)", 0, 255);
        $suffix = 2;

        while (Reminder::query()->where('title', $candidate)->exists()) {
            $candidate = mb_substr("{$title} (cópia {$suffix})", 0, 255);
            $suffix++;
        }

        return $candidate;
    }
}
