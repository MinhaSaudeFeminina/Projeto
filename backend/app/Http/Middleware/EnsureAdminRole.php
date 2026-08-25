<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdminUser() || ! $user->is_active) {
            abort(403, 'Acesso administrativo não autorizado.');
        }

        if ($roles !== [] && ! $user->hasAnyAdminRole($roles)) {
            abort(403, 'Perfil administrativo sem permissão para esta ação.');
        }

        return $next($request);
    }
}
