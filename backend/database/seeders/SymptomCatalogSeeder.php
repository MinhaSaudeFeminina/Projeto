<?php

namespace Database\Seeders;

use App\Models\Symptom;
use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Illuminate\Database\Seeder;

class SymptomCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $normalizer = app(AccentInsensitiveSearchNormalizer::class);

        foreach ($this->catalog() as $item) {
            $searchText = implode(' ', array_filter([
                $item['name'],
                $item['type'],
                $item['short_description'],
                $item['description'],
                $item['category'],
            ]));

            Symptom::updateOrCreate(
                ['name' => $item['name']],
                [...$item, 'search_text_normalized' => $normalizer->normalize($searchText)],
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function catalog(): array
    {
        return [
            $this->item(1, 'Cólica', 'dor', 'Dor no baixo ventre.', 'Menstruação', false, true),
            $this->item(2, 'Dor pélvica', 'dor', 'Dor na região pélvica.', 'Saúde íntima', true, true),
            $this->item(3, 'Corrimento', 'secreção', 'Alteração de secreção vaginal.', 'Saúde íntima', false, false),
            $this->item(4, 'Sangramento fora do período', 'sangramento', 'Sangramento fora do período esperado.', 'Menstruação', true, true),
            $this->item(5, 'Ardor ao urinar', 'dor', 'Dor ou queimação ao urinar.', 'Saúde íntima', true, true),
            $this->item(6, 'Dor nas mamas', 'dor', 'Dor ou sensibilidade mamária.', 'Saúde íntima', false, true),
            $this->item(7, 'Irritabilidade', 'emocional', 'Irritação ou impaciência.', 'TPM e emoções', false, true),
            $this->item(8, 'Ansiedade', 'emocional', 'Sensação persistente de ansiedade.', 'TPM e emoções', false, true),
            $this->item(9, 'Insônia', 'sono', 'Dificuldade para iniciar ou manter o sono.', 'TPM e emoções', false, true),
            $this->item(10, 'Inchaço', 'físico', 'Sensação de inchaço corporal.', 'TPM e emoções', false, false),
            $this->item(11, 'Dor de cabeça', 'dor', 'Dor de cabeça ou cefaleia.', 'TPM e emoções', false, true),
            $this->item(12, 'Alteração de humor', 'emocional', 'Oscilações emocionais.', 'TPM e emoções', false, true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function item(
        int $sortOrder,
        string $name,
        string $type,
        string $shortDescription,
        string $category,
        bool $alert,
        bool $askIntensity,
    ): array {
        return [
            'name' => $name,
            'type' => $type,
            'short_description' => $shortDescription,
            'description' => $shortDescription,
            'icon' => null,
            'category' => $category,
            'show_in_app' => true,
            'ask_intensity' => $askIntensity,
            'ask_notes' => true,
            'is_alert_candidate' => $alert,
            'orientation_text' => 'Registre quando ocorreu e converse com uma profissional de saúde se a queixa persistir ou piorar.',
            'severity_alert_text' => $alert
                ? 'Se a queixa for intensa, súbita ou vier com outros sinais importantes, procure atendimento profissional.'
                : 'Procure avaliação profissional se a queixa for intensa, persistente ou afetar suas atividades.',
            'sort_order' => $sortOrder,
        ];
    }
}
