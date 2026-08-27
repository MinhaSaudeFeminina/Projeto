<?php

namespace Database\Seeders;

use App\Models\AgeRange;
use App\Models\LifeStage;
use Illuminate\Database\Seeder;

class HealthTaxonomySeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['label' => '10-14', 'min_age' => 10, 'max_age' => 14],
            ['label' => '15-19', 'min_age' => 15, 'max_age' => 19],
            ['label' => '20-29', 'min_age' => 20, 'max_age' => 29],
            ['label' => '30-39', 'min_age' => 30, 'max_age' => 39],
            ['label' => '40-49', 'min_age' => 40, 'max_age' => 49],
            ['label' => '50+', 'min_age' => 50, 'max_age' => null],
        ] as $range) {
            AgeRange::updateOrCreate(['label' => $range['label']], $range);
        }

        foreach ([
            ['name' => 'adolescente', 'description' => 'Fase adolescente.', 'sort_order' => 1],
            ['name' => 'adulta', 'description' => 'Fase adulta.', 'sort_order' => 2],
            ['name' => 'climatério/menopausa', 'description' => 'Climatério e menopausa.', 'sort_order' => 5],
        ] as $stage) {
            LifeStage::updateOrCreate(['name' => $stage['name']], $stage);
        }
    }
}
