<?php

namespace App\Http\Requests\Admin;

use App\Models\AdminRole;
use App\Models\Reminder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReminderRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['sometimes', 'required', 'string', Rule::in(Reminder::TYPES)],
            'priority' => ['sometimes', 'required', 'string', Rule::in(Reminder::PRIORITIES)],
            'audience' => ['sometimes', 'required', 'string', 'max:255'],
            'periodicity' => ['sometimes', 'required', 'string', 'max:80'],
            'start_date' => ['sometimes', 'required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', ...$this->endDateBoundary()],
            'short_message' => ['sometimes', 'required', 'string', 'max:160'],
            'expanded_message' => ['sometimes', 'required', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ];
    }

    /**
     * Uma edição parcial pode enviar apenas `end_date`. Nesse caso a data
     * inicial de comparação é a que já está salva, e não um campo ausente.
     *
     * @return list<string>
     */
    private function endDateBoundary(): array
    {
        $reminder = $this->route('reminder');

        $startDate = $this->input('start_date')
            ?? ($reminder instanceof Reminder ? $reminder->start_date?->format('Y-m-d') : null);

        return $startDate === null ? [] : ['after_or_equal:'.$startDate];
    }
}
