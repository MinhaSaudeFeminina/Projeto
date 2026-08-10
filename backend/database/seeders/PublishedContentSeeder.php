<?php

namespace Database\Seeders;

use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Models\User;
use App\Services\Content\AccentInsensitiveSearchNormalizer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PublishedContentSeeder extends Seeder
{
    public function run(): void
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

        $normalizer = app(AccentInsensitiveSearchNormalizer::class);
        $title = 'Entendendo a menstruação';
        $summary = 'Informações acolhedoras sobre ciclo menstrual e saúde íntima.';
        $body = 'A menstruação faz parte da vida de muitas pessoas. Procure atendimento se houver dor intensa, febre ou sangramento muito forte.';

        EducationalContent::updateOrCreate(['slug' => Str::slug($title)], [
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
            'search_text_normalized' => $normalizer->normalize("{$title} {$summary} {$body}"),
        ]);
    }
}
