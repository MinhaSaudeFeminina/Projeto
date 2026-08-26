<?php

use App\Models\AgeRange;
use App\Models\LegalDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('mobile user registers with full access once the current documents are accepted', function () {
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
        ->assertJsonPath('access_state', 'full')
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

    $this->assertDatabaseHas('users', ['email' => 'maria@example.com', 'user_type' => 'mobile_user']);
});

test('mobile login returns full access with current legal acceptance and no email verification', function () {
    LegalDocument::create(['type' => 'terms', 'title' => 'Termos', 'content' => 'Termos.', 'version' => '1.0', 'effective_at' => now(), 'is_active' => true]);
    LegalDocument::create(['type' => 'privacy_policy', 'title' => 'Privacidade', 'content' => 'Política.', 'version' => '1.0', 'effective_at' => now(), 'is_active' => true]);

    $user = User::factory()->create([
        'email' => 'maria@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'mobile_user',
        'email_verified_at' => null,
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

test('inactive mobile user cannot login', function () {
    User::factory()->create([
        'email' => 'bloqueada@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'mobile_user',
        'is_active' => false,
    ]);

    $this->postJson('/api/v1/mobile/auth/login', [
        'email' => 'bloqueada@example.com',
        'password' => 'password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});
