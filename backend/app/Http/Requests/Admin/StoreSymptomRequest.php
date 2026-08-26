<?php

namespace App\Http\Requests\Admin;

use App\Models\Symptom;
use Illuminate\Foundation\Http\FormRequest;

class StoreSymptomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Symptom::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'unique:symptoms,name'],
            'type' => ['required', 'string', 'max:60'],
            'short_description' => ['required', 'string', 'max:255'],
            'full_description' => ['nullable', 'string', 'max:2000'],
            'icon' => ['nullable', 'string', 'max:80'],
            'category' => ['required', 'string', 'max:120'],
            'show_in_app' => ['required', 'boolean'],
            'ask_intensity' => ['required', 'boolean'],
            'ask_notes' => ['required', 'boolean'],
            'generate_ubs_alert' => ['required', 'boolean'],
            'orientation_text' => ['nullable', 'string', 'max:2000'],
            'severity_alert_text' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
        ];
    }
}
