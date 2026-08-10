<?php

namespace App\Services\Health;

use App\Models\SymptomRecord;

class HealthAlertGuidanceService
{
    public function shouldShowAlert(SymptomRecord $record): bool
    {
        return $record->intensity >= 8 || (bool) $record->symptom?->is_alert_candidate;
    }

    public function guidance(): string
    {
        return 'Este registro pode indicar sinal de alerta. Procure uma profissional de saúde ou serviço de urgência se os sintomas forem intensos, persistentes ou vierem com febre, sangramento forte ou dor importante. O app não realiza diagnóstico.';
    }
}
