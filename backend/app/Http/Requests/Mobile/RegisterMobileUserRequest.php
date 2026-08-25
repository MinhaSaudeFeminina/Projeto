<?php

namespace App\Http\Requests\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class RegisterMobileUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'birth_date' => ['required', 'date', 'before:today'],
            'life_stage_id' => ['nullable', 'integer', 'exists:life_stages,id'],
            'accepted_terms' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'accepted_terms.accepted' => 'É necessário aceitar os termos de uso e a política de privacidade.',
            'birth_date.before' => 'Informe uma data de nascimento válida.',
        ];
    }
}
