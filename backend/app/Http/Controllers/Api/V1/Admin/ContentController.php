<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContentRequest;
use App\Http\Requests\Admin\UpdateContentRequest;
use App\Models\EducationalContent;
use App\Services\Audit\AuditRecorder;
use App\Services\Content\AccentInsensitiveSearchNormalizer;
use App\Services\Content\ContentRevisionRecorder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContentController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'data' => EducationalContent::query()->with('category')->latest()->paginate(20),
        ]);
    }

    public function store(StoreContentRequest $request, AccentInsensitiveSearchNormalizer $normalizer, ContentRevisionRecorder $revisions, AuditRecorder $audit)
    {
        $data = $request->validated();
        $content = EducationalContent::create([
            ...$data,
            'slug' => Str::slug($data['title']),
            'status' => EducationalContent::DRAFT,
            'author_id' => $request->user()->id,
            'search_text_normalized' => $normalizer->normalize("{$data['title']} {$data['summary']} {$data['body']}"),
        ]);

        $revisions->record($content, $request->user(), 'created');
        $audit->record($request->user(), EducationalContent::class, $content->id, 'created', [], null, EducationalContent::DRAFT);

        return response()->json(['data' => $content], 201);
    }

    public function show(EducationalContent $content)
    {
        return response()->json(['data' => $content->load('category')]);
    }

    public function update(UpdateContentRequest $request, EducationalContent $content, AccentInsensitiveSearchNormalizer $normalizer, ContentRevisionRecorder $revisions, AuditRecorder $audit)
    {
        $this->authorize('update', $content);
        $data = $request->validated();
        $content->fill($data);
        $content->search_text_normalized = $normalizer->normalize("{$content->title} {$content->summary} {$content->body}");
        $content->save();

        $revisions->record($content, $request->user(), 'edited');
        $audit->record($request->user(), EducationalContent::class, $content->id, 'edited', ['fields' => array_keys($data)], $content->status, $content->status);

        return response()->json(['data' => $content]);
    }
}
