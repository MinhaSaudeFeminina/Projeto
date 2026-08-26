<?php

namespace App\Http\Requests\Admin;

use App\Models\EducationalContent;
use App\Services\Content\HtmlBodySanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', EducationalContent::class) ?? false;
    }

    /** O corpo chega como HTML do editor rico e é limpo antes de validar e persistir. */
    protected function prepareForValidation(): void
    {
        if (! $this->has('body') || ! is_string($this->input('body'))) {
            return;
        }

        $this->merge([
            'body' => app(HtmlBodySanitizer::class)->sanitize($this->input('body')),
        ]);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string', 'max:1000'],
            'body' => ['required', 'string', 'max:100000'],
            'category_id' => ['required', 'integer', Rule::exists('content_categories', 'id')->where('is_active', true)],
            'life_stage_ids' => ['sometimes', 'array'],
            'life_stage_ids.*' => ['integer', 'distinct', Rule::exists('life_stages', 'id')->where('is_active', true)],
            'age_range_ids' => ['sometimes', 'array'],
            'age_range_ids.*' => ['integer', 'distinct', Rule::exists('age_ranges', 'id')->where('is_active', true)],
        ];
    }
}
