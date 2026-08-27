<?php

namespace App\Http\Requests\Admin;

use App\Models\LifeStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLifeStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lifeStage = $this->route('lifeStage');

        return $lifeStage instanceof LifeStage
            && ($this->user()?->can('update', $lifeStage) ?? false);
    }

    /**
     * A `key` da fase não é editável: ela identifica a trilha no aplicativo e
     * nos conteúdos já publicados. A situação também não: ela muda pelas ações
     * de publicar e arquivar, que exigem outro perfil.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $lifeStage = $this->route('lifeStage');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('life_stages', 'name')->ignore($lifeStage instanceof LifeStage ? $lifeStage->id : null),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'ubs_orientation' => ['nullable', 'string', 'max:1000'],
            'warning_signals' => ['sometimes', 'array', 'max:20'],
            'warning_signals.*' => ['required', 'string', 'max:255'],
            'reminder_suggestions' => ['sometimes', 'array', 'max:20'],
            'reminder_suggestions.*' => ['required', 'string', 'max:255'],
            'age_range_id' => ['sometimes', 'nullable', 'integer', Rule::exists('age_ranges', 'id')->where('is_active', true)],
            'sort_order' => ['sometimes', 'required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ];
    }
}
