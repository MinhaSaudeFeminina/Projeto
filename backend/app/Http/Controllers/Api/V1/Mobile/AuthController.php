<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mobile\RegisterMobileUserRequest;
use App\Models\LegalDocument;
use App\Models\User;
use App\Services\Legal\CurrentLegalAcceptanceGate;
use App\Services\Profile\AgeRangeCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly CurrentLegalAcceptanceGate $legalGate)
    {
    }

    public function register(RegisterMobileUserRequest $request, AgeRangeCalculator $calculator): JsonResponse
    {
        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated, $calculator) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'user_type' => 'mobile_user',
                'is_active' => true,
            ]);

            $range = $calculator->rangeForBirthDate($validated['birth_date']);
            $user->profile()->create([
                'birth_date' => $validated['birth_date'],
                'calculated_age' => $calculator->ageFromBirthDate($validated['birth_date']),
                'age_range_id' => $range?->id,
                'life_stage_id' => $validated['life_stage_id'] ?? null,
                'privacy_settings' => ['push_discreet' => true],
            ]);

            LegalDocument::query()
                ->where('is_active', true)
                ->whereIn('type', ['terms', 'privacy_policy'])
                ->get()
                ->each(fn (LegalDocument $document) => DB::table('legal_acceptances')->updateOrInsert([
                    'user_id' => $user->id,
                    'legal_document_id' => $document->id,
                ], [
                    'accepted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));

            return $user;
        });

        return response()->json([
            'token' => $user->createToken('mobile', ['mobile:restricted'])->plainTextToken,
            'access_state' => 'email_verification_required',
            'user' => $user->only(['id', 'name', 'email']),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $validated['email'])
            ->where('user_type', 'mobile_user')
            ->where('is_active', true)
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais informadas são inválidas.'],
            ]);
        }

        $fullAccess = $user->email_verified_at && $this->legalGate->hasAcceptedCurrentDocuments($user);

        return response()->json([
            'token' => $user->createToken('mobile', [$fullAccess ? 'mobile:full' : 'mobile:restricted'])->plainTextToken,
            'access_state' => $fullAccess ? 'full' : 'restricted',
            'user' => $user->only(['id', 'name', 'email']),
        ]);
    }
}
