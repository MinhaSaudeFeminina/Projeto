<?php

namespace App\Http\Requests\Admin;

use App\Models\AdminRole;
use App\Rules\AllowedHealthTopic;
use Illuminate\Foundation\Http\FormRequest;

class StoreContentCategoryRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255', 'unique:content_categories,name', new AllowedHealthTopic],
            'description' => ['nullable', 'string', 'max:1000', new AllowedHealthTopic],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
