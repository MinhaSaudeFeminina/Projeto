<?php

namespace Database\Factories;

use App\Models\Reminder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reminder>
 */
class ReminderFactory extends Factory
{
    protected $model = Reminder::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => 'Exame preventivo (Papanicolau)',
            'description' => 'Lembrete para realização do exame preventivo.',
            'type' => 'exame_preventivo',
            'priority' => 'alta',
            'audience' => 'Mulheres 25-64 anos',
            'periodicity' => 'Anual',
            'start_date' => '2026-01-01',
            'end_date' => null,
            'short_message' => 'Está na hora do seu preventivo!',
            'expanded_message' => 'Procure a UBS para agendar o exame preventivo.',
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }

    public function campaign(): static
    {
        return $this->state(fn (): array => [
            'title' => 'Outubro Rosa',
            'type' => 'campanha',
            'periodicity' => 'Anual',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
        ]);
    }
}
