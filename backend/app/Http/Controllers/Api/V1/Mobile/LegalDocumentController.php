<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mobile\AcceptLegalDocumentsRequest;
use App\Models\LegalDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegalDocumentController extends Controller
{
    public function current(): JsonResponse
    {
        $documents = LegalDocument::query()
            ->where('is_active', true)
            ->whereIn('type', ['terms', 'privacy_policy'])
            ->orderByDesc('effective_at')
            ->get()
            ->unique('type')
            ->values();

        return response()->json(['data' => $documents]);
    }

    public function accept(AcceptLegalDocumentsRequest $request): JsonResponse
    {
        foreach ($request->validated('legal_document_ids') as $documentId) {
            DB::table('legal_acceptances')->updateOrInsert([
                'user_id' => $request->user()->id,
                'legal_document_id' => $documentId,
            ], [
                'accepted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Aceite registrado com sucesso.'], 201);
    }
}
