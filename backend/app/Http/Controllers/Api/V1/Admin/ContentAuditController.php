<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationalContent;
use Illuminate\Http\JsonResponse;

class ContentAuditController extends Controller
{
    public function index(EducationalContent $content): JsonResponse
    {
        $this->authorize('viewAudit', $content);

        return response()->json([
            'data' => $content->auditEvents()
                ->with('actor:id,name')
                ->orderByDesc('occurred_at')
                ->orderByDesc('id')
                ->get(),
        ]);
    }
}
