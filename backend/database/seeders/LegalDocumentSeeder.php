<?php

namespace Database\Seeders;

use App\Models\LegalDocument;
use Illuminate\Database\Seeder;

/**
 * Without an active `terms` and `privacy_policy` pair, CurrentLegalAcceptanceGate
 * never grants `mobile:full`, so every user stays locked out of cycles and
 * symptom records. The texts below are placeholders for the legal team.
 */
class LegalDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            [
                'type' => 'terms',
                'title' => 'Termos de uso',
                'content' => 'Este aplicativo oferece informações educativas sobre saúde da mulher e não substitui avaliação profissional. Ao usar o app, você concorda em fornecer dados verdadeiros e a procurar atendimento presencial quando houver sinais de alerta.',
                'version' => '1.0',
            ],
            [
                'type' => 'privacy_policy',
                'title' => 'Política de privacidade',
                'content' => 'Seus registros de ciclo e sintomas são pessoais e usados apenas para exibir seu histórico e previsões dentro do app. Os dados ficam associados à sua conta e podem ser removidos mediante solicitação.',
                'version' => '1.0',
            ],
        ];

        foreach ($documents as $document) {
            LegalDocument::updateOrCreate(
                ['type' => $document['type'], 'version' => $document['version']],
                $document + ['effective_at' => now(), 'is_active' => true],
            );
        }
    }
}
