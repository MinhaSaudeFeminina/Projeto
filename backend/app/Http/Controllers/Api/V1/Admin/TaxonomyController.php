<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContentCategoryRequest;
use App\Http\Requests\Admin\UpdateContentCategoryRequest;
use App\Models\AdminRole;
use App\Models\AgeRange;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class TaxonomyController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        return response()->json(['data' => [
            'categories' => $this->activeCategories(),
            'life_stages' => $this->activeLifeStages(),
            'age_ranges' => $this->activeAgeRanges(),
        ]]);
    }

    public function categories(): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        return response()->json(['data' => $this->allCategories()], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function storeCategory(StoreContentCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $category = ContentCategory::create([
            ...$data,
            'slug' => $this->uniqueCategorySlug($data['name']),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $category], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function updateCategory(UpdateContentCategoryRequest $request, ContentCategory $category): JsonResponse
    {
        $data = $request->validated();

        if ($category->name !== $data['name']) {
            $data['slug'] = $this->uniqueCategorySlug($data['name'], $category->id);
        }

        $category->fill([
            ...$data,
            'updated_by' => $request->user()->id,
        ])->save();

        return response()->json(['data' => $category->refresh()], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function destroyCategory(ContentCategory $category): Response
    {
        abort_unless(request()->user()?->hasAdminRole(AdminRole::ADMIN), 403);

        if ($category->contents()->exists()) {
            abort(422, 'Categoria vinculada a conteúdos. Desative a categoria em vez de apagar.');
        }

        $category->delete();

        return response()->noContent();
    }

    public function ageRanges(): JsonResponse
    {
        $this->authorize('viewAny', EducationalContent::class);

        return response()->json(['data' => $this->activeAgeRanges()]);
    }

    private function activeCategories(): array
    {
        return ContentCategory::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get()->all();
    }

    private function allCategories(): array
    {
        return ContentCategory::query()->orderBy('sort_order')->orderBy('name')->get()->all();
    }

    private function activeLifeStages(): array
    {
        return LifeStage::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get()->all();
    }

    private function activeAgeRanges(): array
    {
        return AgeRange::query()->where('is_active', true)->orderBy('sort_order')->orderBy('min_age')->get()->all();
    }

    private function uniqueCategorySlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'categoria';
        $slug = $base;
        $suffix = 2;

        while (
            ContentCategory::query()
                ->where('slug', $slug)
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
