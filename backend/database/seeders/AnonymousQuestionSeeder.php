<?php

namespace Database\Seeders;

use App\Models\AnonymousQuestion;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Database\Seeder;

class AnonymousQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $normalizer = app(AccentInsensitiveSearchNormalizer::class);

        foreach ($this->questions() as $question) {
            AnonymousQuestion::updateOrCreate(
                ['question' => $question['question']],
                [
                    ...$question,
                    'search_text_normalized' => $normalizer->normalize("{$question['question']} {$question['category']}"),
                ],
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function questions(): array
    {
        return [
            [
                'question' => 'Meu corrimento mudou de cor, isso é normal?',
                'category' => 'Saúde íntima',
                'status' => AnonymousQuestion::NEW,
                'priority' => AnonymousQuestion::MEDIUM_PRIORITY,
                'is_sensitive' => false,
            ],
            [
                'question' => 'Estou com cólicas muito fortes e a menstruação não desce. O que pode ser?',
                'category' => 'Menstruação',
                'status' => AnonymousQuestion::IN_REVIEW,
                'priority' => AnonymousQuestion::HIGH_PRIORITY,
                'is_sensitive' => false,
            ],
            [
                'question' => 'Posso tomar anticoncepcional por conta própria?',
                'category' => 'Contracepção',
                'status' => AnonymousQuestion::ANSWERED,
                'priority' => AnonymousQuestion::MEDIUM_PRIORITY,
                'answer' => 'Não é recomendado iniciar ou trocar anticoncepcionais sem orientação profissional. Procure sua UBS para receber orientação adequada.',
                'is_sensitive' => false,
            ],
            [
                'question' => 'Meu parceiro me agride e não sei o que fazer.',
                'category' => 'Violência contra a mulher',
                'status' => AnonymousQuestion::IN_REVIEW,
                'priority' => AnonymousQuestion::URGENT_PRIORITY,
                'internal_notes' => 'Caso sensível. Encaminhar informações de apoio e contatos de emergência.',
                'is_sensitive' => true,
            ],
        ];
    }
}
