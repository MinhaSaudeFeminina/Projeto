<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\ContentResource;
use App\Models\EducationalContent;
use App\Services\Content\PublishedContentQuery;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function index(Request $request, PublishedContentQuery $contents)
    {
        return ContentResource::collection(
            $contents->query($request->only(['q', 'category', 'life_stage', 'age_range']))->paginate(20)
        );
    }

    public function show(string $slug)
    {
        $content = EducationalContent::query()
            ->with('category')
            ->where('slug', $slug)
            ->where('status', EducationalContent::PUBLISHED)
            ->whereNull('archived_at')
            ->firstOrFail();

        return new ContentResource($content);
    }
}
