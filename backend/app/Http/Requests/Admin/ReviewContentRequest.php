<?php

namespace App\Http\Requests\Admin;

use App\Models\EducationalContent;
use Illuminate\Foundation\Http\FormRequest;

class ReviewContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $content = $this->route('content');

        return $content instanceof EducationalContent
            && ($this->user()?->can('review', $content) ?? false);
    }

    public function rules(): array
    {
        return [
            'comment' => [
                $this->isRequestingAdjustments() ? 'required' : 'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'comment.required' => 'Informe o comentário com os ajustes necessários.',
            'comment.max' => 'O comentário editorial deve ter no máximo 1000 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('comment') && is_string($this->input('comment'))) {
            $this->merge(['comment' => trim($this->string('comment')->toString())]);
        }
    }

    private function isRequestingAdjustments(): bool
    {
        return $this->route()?->getName() === 'api.v1.admin.contents.request-adjustments';
    }
}
