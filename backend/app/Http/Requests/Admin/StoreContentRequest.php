<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\EducationalContent::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string', 'max:1000'],
            'body' => ['required', 'string'],
            'category_id' => ['required', 'integer', 'exists:content_categories,id'],
            'life_stage_id' => ['nullable', 'integer', 'exists:life_stages,id'],
            'age_range_id' => ['nullable', 'integer', 'exists:age_ranges,id'],
        ];
    }
}
