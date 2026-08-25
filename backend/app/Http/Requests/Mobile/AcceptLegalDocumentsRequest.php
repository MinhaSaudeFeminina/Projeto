<?php

namespace App\Http\Requests\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class AcceptLegalDocumentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'legal_document_ids' => ['required', 'array', 'min:1'],
            'legal_document_ids.*' => ['integer', 'exists:legal_documents,id'],
        ];
    }
}
