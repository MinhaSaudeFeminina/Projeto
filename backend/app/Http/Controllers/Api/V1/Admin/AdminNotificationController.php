<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermission('notifications.view'), Response::HTTP_FORBIDDEN);

        $notifications = AdminNotification::query()
            ->where('recipient_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $notifications,
            'meta' => ['unread_count' => $notifications->whereNull('read_at')->count()],
        ]);
    }

    public function markRead(Request $request, AdminNotification $notification): Response
    {
        abort_unless($request->user()->hasPermission('notifications.view'), Response::HTTP_FORBIDDEN);
        abort_unless($notification->recipient_id === $request->user()->id, Response::HTTP_FORBIDDEN);

        if ($notification->read_at === null) {
            $notification->forceFill(['read_at' => now()])->save();
        }

        return response()->noContent();
    }
}
