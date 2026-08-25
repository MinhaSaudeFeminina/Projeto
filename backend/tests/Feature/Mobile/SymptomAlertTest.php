<?php

use App\Models\Symptom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('alert symptom returns non diagnostic professional care guidance', function () {
    $user = User::factory()->create(['user_type' => 'mobile_user']);
    $token = $user->createToken('mobile')->plainTextToken;
    $symptom = Symptom::create(['name' => 'dor pélvica intensa', 'is_alert_candidate' => true]);

    $this->withToken($token)->postJson('/api/v1/mobile/symptom-records', [
        'symptom_id' => $symptom->id,
        'intensity' => 9,
        'occurred_on' => '2026-06-10',
        'notes' => 'Dor forte.',
    ])->assertCreated()
        ->assertJsonPath('data.alert_shown', true)
        ->assertJsonPath('guidance', fn (string $guidance) => str_contains($guidance, 'não realiza diagnóstico'));
});
