<?php

namespace App\Http\Requests\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenstrualCycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'flow_intensity' => ['nullable', 'in:leve,moderado,intenso'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'symptom_record_ids' => ['nullable', 'array'],
            'symptom_record_ids.*' => ['integer', 'exists:symptom_records,id'],
        ];
    }
}
