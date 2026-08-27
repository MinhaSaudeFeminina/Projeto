<?php

namespace App\Http\Requests\Admin;

use App\Models\EducationalContent;
use App\Rules\AllowedHealthTopic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', EducationalContent::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', new AllowedHealthTopic],
            'summary' => ['required', 'string', 'max:1000', new AllowedHealthTopic],
            'body' => ['required', 'string', 'max:100000', new AllowedHealthTopic],
            'category_id' => ['required', 'integer', Rule::exists('content_categories', 'id')->where('is_active', true)],
            'life_stage_ids' => ['sometimes', 'array'],
            'life_stage_ids.*' => ['integer', 'distinct', Rule::exists('life_stages', 'id')->where('is_active', true)],
            'age_range_ids' => ['sometimes', 'array'],
            'age_range_ids.*' => ['integer', 'distinct', Rule::exists('age_ranges', 'id')->where('is_active', true)],
        ];
    }
}
