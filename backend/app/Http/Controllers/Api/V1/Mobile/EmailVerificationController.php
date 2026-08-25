<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email', 'exists:users,email']]);

        User::where('email', $validated['email'])
            ->where('user_type', 'mobile_user')
            ->update(['email_verified_at' => now()]);

        return response()->json(['message' => 'E-mail validado com sucesso.']);
    }

    public function resend(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        return response()->json(['message' => 'Se a conta existir, enviaremos uma nova validação.'], 202);
    }
}
