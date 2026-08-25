<?php

namespace Database\Seeders;

use App\Models\SupportContact;
use Illuminate\Database\Seeder;

class SupportContactSeeder extends Seeder
{
    public function run(): void
    {
        $contacts = [
            [
                'name' => 'Central de Atendimento à Mulher',
                'description' => 'Ligue 180 para denúncias e orientações sobre violência contra a mulher.',
                'type' => 'emergencia',
                'phone' => '180',
                'link' => null,
                'cta_label' => 'Ligar agora',
                'sort_order' => 10,
                'is_highlighted' => true,
                'is_active' => true,
            ],
            [
                'name' => 'UBS - Unidade Básica de Saúde',
                'description' => 'Encontre a UBS mais próxima para atendimento de saúde.',
                'type' => 'saude',
                'phone' => null,
                'link' => 'https://ubs.saude.gov.br',
                'cta_label' => 'Encontrar UBS',
                'sort_order' => 20,
                'is_highlighted' => true,
                'is_active' => true,
            ],
            [
                'name' => 'SAMU - Serviço de Atendimento Móvel de Urgência',
                'description' => 'Para emergências médicas, ligue 192.',
                'type' => 'emergencia',
                'phone' => '192',
                'link' => null,
                'cta_label' => 'Ligar 192',
                'sort_order' => 30,
                'is_highlighted' => false,
                'is_active' => true,
            ],
            [
                'name' => 'CVV - Centro de Valorização da Vida',
                'description' => 'Apoio emocional e prevenção do suicídio. Ligue 188.',
                'type' => 'apoio_psicologico',
                'phone' => '188',
                'link' => null,
                'cta_label' => 'Ligar 188',
                'sort_order' => 40,
                'is_highlighted' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Delegacia da Mulher',
                'description' => 'Atendimento especializado para mulheres vítimas de violência.',
                'type' => 'seguranca',
                'phone' => null,
                'link' => null,
                'cta_label' => 'Encontrar delegacia',
                'sort_order' => 50,
                'is_highlighted' => false,
                'is_active' => true,
            ],
            [
                'name' => 'CRAS - Centro de Referência de Assistência Social',
                'description' => 'Assistência social e proteção às famílias.',
                'type' => 'assistencia_social',
                'phone' => null,
                'link' => null,
                'cta_label' => 'Saiba mais',
                'sort_order' => 60,
                'is_highlighted' => false,
                'is_active' => true,
            ],
        ];

        foreach ($contacts as $contact) {
            SupportContact::updateOrCreate(
                ['name' => $contact['name']],
                $contact,
            );
        }
    }
}
