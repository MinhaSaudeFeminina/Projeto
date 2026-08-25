<?php

use App\Models\AgeRange;
use App\Models\LegalDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('mobile user registers with restricted access until email verification', function () {
    AgeRange::create(['label' => '20-29', 'min_age' => 20, 'max_age' => 29]);
    LegalDocument::create(['type' => 'terms', 'title' => 'Termos', 'content' => 'Termos de uso.', 'version' => '1.0', 'effective_at' => now(), 'is_active' => true]);
    LegalDocument::create(['type' => 'privacy_policy', 'title' => 'Privacidade', 'content' => 'Política de privacidade.', 'version' => '1.0', 'effective_at' => now(), 'is_active' => true]);

    $response = $this->postJson('/api/v1/mobile/auth/register', [
        'name' => 'Maria Saúde',
        'email' => 'maria@example.com',
        'password' => 'password',
        'birth_date' => now()->subYears(25)->toDateString(),
        'accepted_terms' => true,
    ]);

    $response->assertCreated()
        ->assertJsonPath('access_state', 'email_verification_required')
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

    $this->assertDatabaseHas('users', ['email' => 'maria@example.com', 'user_type' => 'mobile_user']);
});

test('mobile login returns full access after email verification and current legal acceptance', function () {
    LegalDocument::create(['type' => 'terms', 'title' => 'Termos', 'content' => 'Termos.', 'version' => '1.0', 'effective_at' => now(), 'is_active' => true]);
    LegalDocument::create(['type' => 'privacy_policy', 'title' => 'Privacidade', 'content' => 'Política.', 'version' => '1.0', 'effective_at' => now(), 'is_active' => true]);

    $user = User::factory()->create([
        'email' => 'maria@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'mobile_user',
        'email_verified_at' => now(),
    ]);

    foreach (LegalDocument::all() as $document) {
        DB::table('legal_acceptances')->insert([
            'user_id' => $user->id,
            'legal_document_id' => $document->id,
            'accepted_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $this->postJson('/api/v1/mobile/auth/login', [
        'email' => 'maria@example.com',
        'password' => 'password',
    ])->assertOk()->assertJsonPath('access_state', 'full');
});
