<?php

namespace Database\Factories;

use App\Models\AnonymousQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnonymousQuestion>
 */
class AnonymousQuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'question' => fake()->sentence().' Isso é normal?',
            'category' => fake()->randomElement(['Saúde íntima', 'Menstruação', 'Contracepção']),
            'status' => AnonymousQuestion::NEW,
            'priority' => AnonymousQuestion::MEDIUM_PRIORITY,
            'is_sensitive' => false,
        ];
    }
}
