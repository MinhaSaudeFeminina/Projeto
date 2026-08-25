<?php

use Illuminate\Support\Facades\Route;

it('exposes mobile API routes used by the mobile frontend authentication flow', function (): void {
    $uris = collect(Route::getRoutes())->map(fn ($route) => $route->uri())->values();

    expect($uris)->toContain(
        'api/v1/mobile/auth/register',
        'api/v1/mobile/auth/login',
        'api/v1/mobile/auth/email/verify',
        'api/v1/mobile/legal-documents/current',
        'api/v1/mobile/legal-acceptances',
        'api/v1/mobile/me',
    );
});
