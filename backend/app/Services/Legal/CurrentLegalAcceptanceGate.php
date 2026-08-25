<?php

namespace App\Services\Legal;

use App\Models\LegalDocument;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CurrentLegalAcceptanceGate
{
    public function currentRequiredDocuments()
    {
        return LegalDocument::query()
            ->where('is_active', true)
            ->whereIn('type', ['terms', 'privacy_policy'])
            ->where('effective_at', '<=', now())
            ->orderByDesc('effective_at')
            ->get()
            ->unique('type')
            ->values();
    }

    public function hasAcceptedCurrentDocuments(User $user): bool
    {
        $documentIds = $this->currentRequiredDocuments()->pluck('id');

        if ($documentIds->count() < 2) {
            return false;
        }

        $accepted = DB::table('legal_acceptances')
            ->where('user_id', $user->id)
            ->whereIn('legal_document_id', $documentIds)
            ->distinct()
            ->count('legal_document_id');

        return $accepted === $documentIds->count();
    }
}
