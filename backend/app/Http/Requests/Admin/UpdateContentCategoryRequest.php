<?php

namespace App\Http\Requests\Admin;

use App\Models\AdminRole;
use App\Models\ContentCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContentCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAdminRole(AdminRole::ADMIN) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('category');
        $categoryId = $category instanceof ContentCategory ? $category->id : null;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('content_categories', 'name')->ignore($categoryId)],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
