<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditEvent;
use App\Models\EducationalContent;

class ContentAuditController extends Controller
{
    public function index(EducationalContent $content)
    {
        return response()->json([
            'data' => AuditEvent::query()
                ->where('target_type', EducationalContent::class)
                ->where('target_id', $content->id)
                ->latest('created_at')
                ->get(),
        ]);
    }
}
