<?php

namespace App\Http\Resources\Concerns;

trait UsesPortugueseMessages
{
    protected function successMessage(string $message = 'Operação realizada com sucesso.'): array
    {
        return ['message' => $message];
    }
}
