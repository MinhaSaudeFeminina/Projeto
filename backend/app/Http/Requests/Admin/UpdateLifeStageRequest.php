<?php

namespace App\Http\Requests\Admin;

use App\Models\AdminRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLifeStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAdminRole(AdminRole::ADMIN) ?? false;
    }

    /**
     * A `key` da fase não é editável: ela identifica a trilha no aplicativo e
     * nos conteúdos já publicados.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'ubs_orientation' => ['nullable', 'string', 'max:1000'],
            'warning_signals' => ['sometimes', 'array', 'max:20'],
            'warning_signals.*' => ['required', 'string', 'max:255'],
            'reminder_suggestions' => ['sometimes', 'array', 'max:20'],
            'reminder_suggestions.*' => ['required', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ];
    }
}
