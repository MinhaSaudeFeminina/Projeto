<?php

namespace App\Http\Requests\Admin;

use App\Models\Symptom;
use App\Rules\AllowedHealthTopic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSymptomRequest extends FormRequest
{
    public function authorize(): bool
    {
        $symptom = $this->route('symptom');

        return $symptom instanceof Symptom
            && ($this->user()?->can('update', $symptom) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Symptom $symptom */
        $symptom = $this->route('symptom');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120', Rule::unique('symptoms', 'name')->ignore($symptom->id), new AllowedHealthTopic],
            'type' => ['sometimes', 'required', 'string', 'max:60', new AllowedHealthTopic],
            'short_description' => ['sometimes', 'required', 'string', 'max:255', new AllowedHealthTopic],
            'full_description' => ['sometimes', 'nullable', 'string', 'max:2000', new AllowedHealthTopic],
            'icon' => ['sometimes', 'nullable', 'string', 'max:80'],
            'category' => ['sometimes', 'required', 'string', 'max:120', new AllowedHealthTopic],
            'show_in_app' => ['sometimes', 'required', 'boolean'],
            'ask_intensity' => ['sometimes', 'required', 'boolean'],
            'ask_notes' => ['sometimes', 'required', 'boolean'],
            'generate_ubs_alert' => ['sometimes', 'required', 'boolean'],
            'orientation_text' => ['sometimes', 'nullable', 'string', 'max:2000', new AllowedHealthTopic],
            'severity_alert_text' => ['sometimes', 'nullable', 'string', 'max:2000', new AllowedHealthTopic],
            'sort_order' => ['sometimes', 'required', 'integer', 'min:0', 'max:9999'],
        ];
    }
}
