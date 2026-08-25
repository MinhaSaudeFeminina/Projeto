<?php

namespace App\Http\Requests\Admin;

use App\Models\AdminRole;
use Illuminate\Foundation\Http\FormRequest;

class StoreSupportContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAdminRole(AdminRole::ADMIN) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:40'],
            'link' => ['nullable', 'url', 'max:2048'],
            'cta_label' => ['required', 'string', 'max:120'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_highlighted' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
