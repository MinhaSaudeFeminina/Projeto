<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentRevision;
use App\Models\EducationalContent;
use Illuminate\Http\JsonResponse;

class ContentRevisionController extends Controller
{
    public function index(EducationalContent $content): JsonResponse
    {
        $this->authorize('viewAudit', $content);

        $revisions = $content->revisions()
            ->with('changedBy:id,name')
            ->orderByDesc('version')
            ->get()
            ->map(fn (ContentRevision $revision): array => [
                ...$revision->attributesToArray(),
                'changed_by_user' => $revision->changedBy?->only(['id', 'name']),
            ]);

        return response()->json(['data' => $revisions]);
    }
}
