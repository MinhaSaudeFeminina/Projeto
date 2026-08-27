<?php

namespace App\Http\Requests\Admin;

use App\Models\Symptom;
use App\Rules\AllowedHealthTopic;
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
            'name' => ['required', 'string', 'max:120', 'unique:symptoms,name', new AllowedHealthTopic],
            'type' => ['required', 'string', 'max:60', new AllowedHealthTopic],
            'short_description' => ['required', 'string', 'max:255', new AllowedHealthTopic],
            'full_description' => ['nullable', 'string', 'max:2000', new AllowedHealthTopic],
            'icon' => ['nullable', 'string', 'max:80'],
            'category' => ['required', 'string', 'max:120', new AllowedHealthTopic],
            'show_in_app' => ['required', 'boolean'],
            'ask_intensity' => ['required', 'boolean'],
            'ask_notes' => ['required', 'boolean'],
            'generate_ubs_alert' => ['required', 'boolean'],
            'orientation_text' => ['nullable', 'string', 'max:2000', new AllowedHealthTopic],
            'severity_alert_text' => ['nullable', 'string', 'max:2000', new AllowedHealthTopic],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
        ];
    }
}
