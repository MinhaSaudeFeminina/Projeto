<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationalContent;

class DashboardController extends Controller
{
    public function show()
    {
        return response()->json([
            'data' => [
                'drafts' => EducationalContent::where('status', EducationalContent::DRAFT)->count(),
                'in_review' => EducationalContent::where('status', EducationalContent::IN_REVIEW)->count(),
                'published' => EducationalContent::where('status', EducationalContent::PUBLISHED)->count(),
                'archived' => EducationalContent::where('status', EducationalContent::ARCHIVED)->count(),
            ],
        ]);
    }
}
