<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('mobile user can create and list menstrual cycle', function () {
    $user = User::factory()->create(['user_type' => 'mobile_user']);
    $token = $user->createToken('mobile')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/mobile/cycles', [
        'start_date' => '2026-06-01',
        'end_date' => '2026-06-05',
        'flow_intensity' => 'moderado',
    ])->assertCreated()->assertJsonPath('data.flow_intensity', 'moderado');

    $this->withToken($token)->getJson('/api/v1/mobile/cycles')->assertOk()->assertJsonCount(1, 'data');
});

test('cycle end date cannot be before start date', function () {
    $user = User::factory()->create(['user_type' => 'mobile_user']);
    $token = $user->createToken('mobile')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/mobile/cycles', [
        'start_date' => '2026-06-05',
        'end_date' => '2026-06-01',
    ])->assertUnprocessable()->assertJsonValidationErrors('end_date');
});
