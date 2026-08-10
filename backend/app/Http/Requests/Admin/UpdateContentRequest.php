<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'summary' => ['sometimes', 'string', 'max:1000'],
            'body' => ['sometimes', 'string'],
            'category_id' => ['sometimes', 'integer', 'exists:content_categories,id'],
            'life_stage_id' => ['nullable', 'integer', 'exists:life_stages,id'],
            'age_range_id' => ['nullable', 'integer', 'exists:age_ranges,id'],
        ];
    }
}
