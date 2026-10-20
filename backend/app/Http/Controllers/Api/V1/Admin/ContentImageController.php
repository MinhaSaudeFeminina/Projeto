<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContentImageRequest;
use App\Models\EducationalContent;
use App\Services\Content\EditorialImageStorage;
use Illuminate\Http\JsonResponse;

class ContentImageController extends Controller
{
    public function store(
        StoreContentImageRequest $request,
        EducationalContent $content,
        EditorialImageStorage $storage,
    ): JsonResponse {
        return response()->json([
            'data' => ['url' => $storage->store($request->file('image'))],
        ], 201);
    }
}
