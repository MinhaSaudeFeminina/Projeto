<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AnswerAnonymousQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('anonymous_questions.manage') ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'answer' => ['required', 'string', 'max:5000'],
            'internal_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'answer.required' => 'Informe a resposta orientativa.',
            'answer.max' => 'A resposta deve ter no máximo 5000 caracteres.',
            'internal_notes.max' => 'A observação interna deve ter no máximo 5000 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (['answer', 'internal_notes'] as $field) {
            if ($this->has($field) && is_string($this->input($field))) {
                $this->merge([$field => trim($this->string($field)->toString())]);
            }
        }
    }
}
