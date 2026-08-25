<?php

namespace App\Http\Resources\Admin\Concerns;

use Illuminate\Http\JsonResponse;

trait UsesAdminApiResponses
{
    protected function successResponse(mixed $data = null, string $message = 'Operação realizada com sucesso.', int $status = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }

    protected function emptyResponse(int $status = 204): JsonResponse
    {
        return response()->json(null, $status, [], JSON_UNESCAPED_UNICODE);
    }

    protected function errorResponse(string $message = 'Não foi possível concluir a solicitação.', int $status = 422): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }
}
