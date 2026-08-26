<?php

namespace App\Http\Requests\Admin;

use App\Models\AdminRole;
use App\Models\Reminder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReminderRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'string', Rule::in(Reminder::TYPES)],
            'priority' => ['required', 'string', Rule::in(Reminder::PRIORITIES)],
            'audience' => ['required', 'string', 'max:255'],
            'periodicity' => ['required', 'string', 'max:80'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'short_message' => ['required', 'string', 'max:160'],
            'expanded_message' => ['required', 'string', 'max:2000'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
