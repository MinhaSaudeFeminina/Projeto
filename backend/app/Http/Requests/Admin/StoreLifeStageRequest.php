<?php

namespace App\Http\Requests\Admin;

use App\Models\LifeStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLifeStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', LifeStage::class) ?? false;
    }

    /**
     * A `key` não vem do formulário: o controller a deriva do nome, porque ela
     * identifica a trilha no app e nos conteúdos já publicados.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('life_stages', 'name')],
            'description' => ['nullable', 'string', 'max:1000'],
            'ubs_orientation' => ['nullable', 'string', 'max:1000'],
            'warning_signals' => ['sometimes', 'array', 'max:20'],
            'warning_signals.*' => ['required', 'string', 'max:255'],
            'reminder_suggestions' => ['sometimes', 'array', 'max:20'],
            'reminder_suggestions.*' => ['required', 'string', 'max:255'],
            'age_range_id' => ['required', 'integer', Rule::exists('age_ranges', 'id')->where('is_active', true)],
            'sort_order' => ['sometimes', 'required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ];
    }
}
