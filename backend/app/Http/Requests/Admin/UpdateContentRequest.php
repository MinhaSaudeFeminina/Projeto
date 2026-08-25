<?php

namespace App\Http\Requests\Admin;

use App\Models\EducationalContent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $content = $this->route('content');

        return $content instanceof EducationalContent
            && ($this->user()?->can('update', $content) ?? false);
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'summary' => ['sometimes', 'required', 'string', 'max:1000'],
            'body' => ['sometimes', 'required', 'string', 'max:100000'],
            'category_id' => ['sometimes', 'required', 'integer', Rule::exists('content_categories', 'id')->where('is_active', true)],
            'life_stage_ids' => ['sometimes', 'array'],
            'life_stage_ids.*' => ['integer', 'distinct', Rule::exists('life_stages', 'id')->where('is_active', true)],
            'age_range_ids' => ['sometimes', 'array'],
            'age_range_ids.*' => ['integer', 'distinct', Rule::exists('age_ranges', 'id')->where('is_active', true)],
        ];
    }
}
