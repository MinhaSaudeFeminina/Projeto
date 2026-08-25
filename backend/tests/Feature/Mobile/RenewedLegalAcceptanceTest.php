<?php

use App\Models\LegalDocument;
use App\Models\User;
use App\Services\Legal\CurrentLegalAcceptanceGate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('new active legal document version requires renewed acceptance', function () {
    $user = User::factory()->create(['user_type' => 'mobile_user', 'email_verified_at' => now()]);
    $termsV1 = LegalDocument::create(['type' => 'terms', 'title' => 'Termos', 'content' => 'v1', 'version' => '1.0', 'effective_at' => now()->subDay(), 'is_active' => true]);
    $privacy = LegalDocument::create(['type' => 'privacy_policy', 'title' => 'Privacidade', 'content' => 'v1', 'version' => '1.0', 'effective_at' => now()->subDay(), 'is_active' => true]);

    foreach ([$termsV1, $privacy] as $document) {
        DB::table('legal_acceptances')->insert([
            'user_id' => $user->id,
            'legal_document_id' => $document->id,
            'accepted_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    expect(app(CurrentLegalAcceptanceGate::class)->hasAcceptedCurrentDocuments($user))->toBeTrue();

    LegalDocument::create(['type' => 'terms', 'title' => 'Termos', 'content' => 'v2', 'version' => '2.0', 'effective_at' => now(), 'is_active' => true]);

    expect(app(CurrentLegalAcceptanceGate::class)->hasAcceptedCurrentDocuments($user))->toBeFalse();
});
