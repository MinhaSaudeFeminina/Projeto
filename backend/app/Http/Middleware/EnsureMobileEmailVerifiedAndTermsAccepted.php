<?php

namespace App\Http\Middleware;

use App\Services\Legal\CurrentLegalAcceptanceGate;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMobileEmailVerifiedAndTermsAccepted
{
    public function __construct(private readonly CurrentLegalAcceptanceGate $legalGate)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isMobileUser()) {
            abort(403, 'Acesso permitido apenas para usuárias do aplicativo.');
        }

        if (! $user->email_verified_at || ! $this->legalGate->hasAcceptedCurrentDocuments($user)) {
            return response()->json([
                'message' => 'Valide seu e-mail e aceite os documentos vigentes para continuar.',
                'access_state' => 'restricted',
            ], 403);
        }

        return $next($request);
    }
}
