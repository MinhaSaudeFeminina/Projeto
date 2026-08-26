<?php

namespace Database\Seeders;

use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\LifeStage;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoReportsSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::query()->where('user_type', 'admin_user')->firstOrFail();
        $category = ContentCategory::query()->firstOrCreate(
            ['slug' => 'demo-relatorios'],
            [
                'name' => 'Demonstra\u{00E7}\u{00E3}o de relat\u{00F3}rios',
                'description' => 'Categoria para dados demonstrativos do relat\u{00F3}rio.',
                'sort_order' => 99,
                'is_active' => true,
            ],
        );

        $records = [
            ['slug' => 'demo-relatorio-rascunho', 'title' => "Orienta\u{00E7}\u{00F5}es para o ciclo", 'status' => EducationalContent::DRAFT, 'stage' => 'adolescencia'],
            ['slug' => 'demo-relatorio-revisao', 'title' => "Sa\u{00FA}de \u{00ED}ntima na vida adulta", 'status' => EducationalContent::IN_REVIEW, 'stage' => 'vida_adulta'],
            ['slug' => 'demo-relatorio-aprovado', 'title' => "Cuidados na gesta\u{00E7}\u{00E3}o", 'status' => EducationalContent::APPROVED, 'stage' => 'gestacao'],
            ['slug' => 'demo-relatorio-publicado', 'title' => "Bem-estar no puerp\u{00E9}rio", 'status' => EducationalContent::PUBLISHED, 'stage' => 'puerperio'],
            ['slug' => 'demo-relatorio-arquivado', 'title' => "Climat\u{00E9}rio e menopausa", 'status' => EducationalContent::ARCHIVED, 'stage' => 'climaterio_menopausa'],
        ];

        foreach ($records as $record) {
            $content = EducationalContent::updateOrCreate(
                ['slug' => $record['slug']],
                [
                    'title' => $record['title'],
                    'summary' => 'Conte\u{00FA}do demonstrativo para visualizar os relat\u{00F3}rios.',
                    'body' => 'Este registro foi criado para demonstra\u{00E7}\u{00E3}o local do portal administrativo.',
                    'category_id' => $category->id,
                    'status' => $record['status'],
                    'author_id' => $author->id,
                    'approved_by' => in_array($record['status'], [EducationalContent::APPROVED, EducationalContent::PUBLISHED, EducationalContent::ARCHIVED], true) ? $author->id : null,
                    'approved_at' => in_array($record['status'], [EducationalContent::APPROVED, EducationalContent::PUBLISHED, EducationalContent::ARCHIVED], true) ? now() : null,
                    'published_by' => in_array($record['status'], [EducationalContent::PUBLISHED, EducationalContent::ARCHIVED], true) ? $author->id : null,
                    'published_at' => in_array($record['status'], [EducationalContent::PUBLISHED, EducationalContent::ARCHIVED], true) ? now() : null,
                    'archived_by' => $record['status'] === EducationalContent::ARCHIVED ? $author->id : null,
                    'archived_at' => $record['status'] === EducationalContent::ARCHIVED ? now() : null,
                ],
            );

            $stage = LifeStage::query()->where('key', $record['stage'])->first();
            if ($stage) {
                $content->lifeStages()->sync([$stage->id]);
            }
        }
    }
}
