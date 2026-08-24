<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewContentRequest;
use App\Models\EducationalContent;
use App\Services\Content\EditorialWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EditorialActionController extends Controller
{
    public function submitReview(Request $request, EducationalContent $content, EditorialWorkflowService $workflow): JsonResponse
    {
        $this->authorize('submit', $content);

        return response()->json(['data' => $workflow->submit($content, $request->user())]);
    }

    public function requestAdjustments(ReviewContentRequest $request, EducationalContent $content, EditorialWorkflowService $workflow): JsonResponse
    {
        return response()->json([
            'data' => $workflow->requestAdjustments($content, $request->user(), (string) $request->validated('comment')),
        ]);
    }

    public function approve(ReviewContentRequest $request, EducationalContent $content, EditorialWorkflowService $workflow): JsonResponse
    {
        return response()->json([
            'data' => $workflow->approve($content, $request->user(), $request->validated('comment')),
        ]);
    }

    public function publish(Request $request, EducationalContent $content, EditorialWorkflowService $workflow): JsonResponse
    {
        $this->authorize('publish', $content);

        return response()->json(['data' => $workflow->publish($content, $request->user())]);
    }

    public function archive(Request $request, EducationalContent $content, EditorialWorkflowService $workflow): JsonResponse
    {
        $this->authorize('archive', $content);

        return response()->json(['data' => $workflow->archive($content, $request->user())]);
    }
}
