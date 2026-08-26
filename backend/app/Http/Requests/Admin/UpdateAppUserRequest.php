<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('admin_users.manage') === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->route('appUser')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'life_stage_id' => ['nullable', 'integer', Rule::exists('life_stages', 'id')],
            'notifications_active' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
