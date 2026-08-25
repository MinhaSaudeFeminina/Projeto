<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Services\Profile\AgeRangeCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request, AgeRangeCalculator $calculator): JsonResponse
    {
        $user = $request->user()->load('profile');
        $profile = $user->profile;

        return response()->json([
            'user' => $user->only(['id', 'name', 'email']),
            'profile' => [
                'birth_date' => $profile?->birth_date?->toDateString(),
                'calculated_age' => $profile ? $calculator->ageFromBirthDate($profile->birth_date->toDateString()) : null,
                'age_range' => $profile?->age_range_id,
                'life_stage_id' => $profile?->life_stage_id,
            ],
        ]);
    }

    public function update(Request $request, AgeRangeCalculator $calculator): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'date', 'before:today'],
            'life_stage_id' => ['nullable', 'integer', 'exists:life_stages,id'],
        ]);

        $user = $request->user();

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        if (isset($validated['birth_date']) || array_key_exists('life_stage_id', $validated)) {
            $birthDate = $validated['birth_date'] ?? $user->profile?->birth_date?->toDateString();
            $range = $birthDate ? $calculator->rangeForBirthDate($birthDate) : null;
            $user->profile()->updateOrCreate(['user_id' => $user->id], [
                'birth_date' => $birthDate,
                'calculated_age' => $birthDate ? $calculator->ageFromBirthDate($birthDate) : null,
                'age_range_id' => $range?->id,
                'life_stage_id' => $validated['life_stage_id'] ?? $user->profile?->life_stage_id,
            ]);
        }

        return $this->show($request, $calculator);
    }
}
