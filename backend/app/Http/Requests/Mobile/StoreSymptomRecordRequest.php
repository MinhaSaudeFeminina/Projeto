<?php

namespace App\Http\Requests\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class StoreSymptomRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'symptom_id' => ['nullable', 'integer', 'exists:symptoms,id'],
            'custom_symptom' => ['nullable', 'string', 'max:120', 'required_without:symptom_id'],
            'intensity' => ['required', 'integer', 'min:1', 'max:10'],
            'occurred_on' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
