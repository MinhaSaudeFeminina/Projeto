<?php

namespace Database\Seeders;

use App\Models\AgeRange;
use App\Models\LifeStage;
use Illuminate\Database\Seeder;

class ContentTaxonomySeeder extends Seeder
{
    public function run(): void
    {
        $lifeStages = [
            ['key' => 'adolescencia', 'name' => 'Adolescência', 'sort_order' => 10],
            ['key' => 'vida_adulta', 'name' => 'Vida adulta', 'sort_order' => 20],
            ['key' => 'gestacao', 'name' => 'Gestação', 'sort_order' => 30],
            ['key' => 'puerperio', 'name' => 'Puerpério', 'sort_order' => 40],
            ['key' => 'climaterio_menopausa', 'name' => 'Climatério/menopausa', 'sort_order' => 50],
        ];

        foreach ($lifeStages as $stage) {
            LifeStage::updateOrCreate(
                ['key' => $stage['key']],
                $stage + ['is_active' => true],
            );
        }

        $ageRanges = [
            ['label' => '10-14', 'min_age' => 10, 'max_age' => 14, 'sort_order' => 10],
            ['label' => '15-19', 'min_age' => 15, 'max_age' => 19, 'sort_order' => 20],
            ['label' => '20-29', 'min_age' => 20, 'max_age' => 29, 'sort_order' => 30],
            ['label' => '30-39', 'min_age' => 30, 'max_age' => 39, 'sort_order' => 40],
            ['label' => '40-49', 'min_age' => 40, 'max_age' => 49, 'sort_order' => 50],
            ['label' => '50+', 'min_age' => 50, 'max_age' => null, 'sort_order' => 60],
        ];

        foreach ($ageRanges as $range) {
            AgeRange::updateOrCreate(
                ['label' => $range['label']],
                $range + ['is_active' => true],
            );
        }
    }
}
