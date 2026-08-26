<?php

namespace Database\Seeders;

use App\Models\Symptom;
use Illuminate\Database\Seeder;

class SymptomCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // `is_alert_candidate` drives HealthAlertGuidanceService, which nudges
        // the user towards a UBS when one of these is recorded.
        $symptoms = [
            ['name' => 'Cólica', 'description' => 'Dor na parte baixa da barriga.', 'is_alert_candidate' => false],
            ['name' => 'Dor pélvica', 'description' => 'Dor persistente na região pélvica.', 'is_alert_candidate' => true],
            ['name' => 'Corrimento', 'description' => 'Alteração no corrimento vaginal.', 'is_alert_candidate' => true],
            ['name' => 'Sangramento fora do período', 'description' => 'Sangramento entre menstruações.', 'is_alert_candidate' => true],
            ['name' => 'Ardor ao urinar', 'description' => 'Dor ou ardor ao urinar.', 'is_alert_candidate' => true],
            ['name' => 'Dor nas mamas', 'description' => 'Sensibilidade ou dor nas mamas.', 'is_alert_candidate' => false],
            ['name' => 'Humor alterado', 'description' => 'Oscilações de humor.', 'is_alert_candidate' => false],
            ['name' => 'Ansiedade', 'description' => 'Sensação de ansiedade.', 'is_alert_candidate' => false],
            ['name' => 'Irritabilidade', 'description' => 'Irritabilidade acentuada.', 'is_alert_candidate' => false],
            ['name' => 'Alteração no sono', 'description' => 'Dificuldade para dormir ou sono excessivo.', 'is_alert_candidate' => false],
            ['name' => 'Inchaço', 'description' => 'Retenção de líquidos ou inchaço.', 'is_alert_candidate' => false],
            ['name' => 'Dor de cabeça', 'description' => 'Dor de cabeça ou enxaqueca.', 'is_alert_candidate' => false],
            ['name' => 'Libido alterada', 'description' => 'Mudança no desejo sexual.', 'is_alert_candidate' => false],
            ['name' => 'Febre', 'description' => 'Temperatura acima do normal.', 'is_alert_candidate' => true],
        ];

        foreach ($symptoms as $symptom) {
            Symptom::updateOrCreate(['name' => $symptom['name']], $symptom);
        }
    }
}
