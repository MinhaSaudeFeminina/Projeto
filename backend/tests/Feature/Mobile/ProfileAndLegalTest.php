<?php

use App\Models\AgeRange;
use App\Models\LegalDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('mobile user can view current legal documents and accept them', function () {
    $document = LegalDocument::create([
        'type' => 'terms',
        'title' => 'Termos de uso',
        'content' => 'Conteúdo com acentuação.',
        'version' => '1.0',
        'effective_at' => now(),
        'is_active' => true,
    ]);
    $user = User::factory()->create(['user_type' => 'mobile_user']);
    $token = $user->createToken('mobile')->plainTextToken;

    $this->getJson('/api/v1/mobile/legal-documents/current')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Termos de uso');

    $this->withToken($token)
        ->postJson('/api/v1/mobile/legal-acceptances', ['legal_document_ids' => [$document->id]])
        ->assertCreated();
});

test('mobile profile returns calculated age and age range', function () {
    $range = AgeRange::create(['label' => '30-39', 'min_age' => 30, 'max_age' => 39]);
    $user = User::factory()->create(['user_type' => 'mobile_user']);
    $user->profile()->create([
        'birth_date' => now()->subYears(35)->toDateString(),
        'calculated_age' => 35,
        'age_range_id' => $range->id,
    ]);

    $token = $user->createToken('mobile')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/v1/mobile/me')
        ->assertOk()
        ->assertJsonPath('profile.age_range', $range->id);
});
