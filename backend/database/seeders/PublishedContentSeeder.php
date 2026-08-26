<?php

namespace Database\Seeders;

use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\User;
use App\Services\Content\ContentTextPreparationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PublishedContentSeeder extends Seeder
{
    public function run(ContentTextPreparationService $textPreparation): void
    {
        $author = User::firstOrCreate(['email' => 'conteudo@example.com'], [
            'name' => 'Equipe de Conteúdo',
            'password' => bcrypt('password'),
            'user_type' => 'admin_user',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $category = ContentCategory::firstOrCreate(['slug' => 'ciclo-menstrual'], [
            'name' => 'Ciclo menstrual',
            'description' => 'Conteúdos sobre menstruação, sintomas e autocuidado.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $title = 'Entendendo a menstruação';
        $summary = 'Informações acolhedoras sobre ciclo menstrual e saúde íntima.';

        // Rich text, limited to the tags HtmlBodySanitizer keeps.
        $body = <<<'HTML'
        <p>A menstruação faz parte da vida de muitas pessoas e acompanhar o próprio ciclo ajuda a perceber o que é o seu normal.</p>
        <h2>O que costuma ser esperado</h2>
        <p>Um ciclo dura em média <strong>28 dias</strong>, mas variações entre 21 e 35 dias também são comuns. O fluxo costuma durar de 3 a 7 dias.</p>
        <h3>Sinais de alerta</h3>
        <p>Procure uma unidade de saúde se notar:</p>
        <ul><li>Dor intensa que não melhora com medidas simples</li><li>Sangramento muito forte ou com coágulos grandes</li><li><strong>Febre</strong> junto do sangramento</li><li>Ausência de menstruação por três meses seguidos</li></ul>
        <h3>O que você pode fazer em casa</h3>
        <ol><li>Aplique compressa morna na região da barriga</li><li>Mantenha-se hidratada ao longo do dia</li><li>Faça caminhadas leves, se estiver confortável</li><li>Registre no app as datas e os sintomas</li></ol>
        <blockquote><p>Anotar o que você sente ajuda muito na hora da consulta. Leve seus registros com você.</p></blockquote>
        <p>Em caso de dúvida, converse com a equipe da sua UBS. Este conteúdo é <em>educativo</em> e não substitui avaliação profissional.</p>
        HTML;

        $content = EducationalContent::updateOrCreate(['slug' => Str::slug($title)], [
            'title' => $title,
            'summary' => $summary,
            'body' => $body,
            'category_id' => $category->id,
            'status' => EducationalContent::PUBLISHED,
            'author_id' => $author->id,
            'approved_by' => $author->id,
            'approved_at' => now(),
            'published_by' => $author->id,
            'published_at' => now(),
        ]);

        $textPreparation->refreshSearchIndex($content);
    }
}
