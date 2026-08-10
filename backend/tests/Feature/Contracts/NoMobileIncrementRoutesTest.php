<?php

use Illuminate\Support\Facades\Route;

it('does not expose active mobile or final-user routes in the current increment', function (): void {
    $forbiddenFragments = [
        'api/v1/mobile',
        'mobile',
        'cycles',
        'symptom',
        'legal-documents',
        'email/verify',
    ];

    $uris = collect(Route::getRoutes())
        ->map(fn ($route) => $route->uri())
        ->values();

    foreach ($forbiddenFragments as $fragment) {
        expect($uris->filter(fn (string $uri) => str_contains($uri, $fragment))->all())
            ->toBe([], "Rota fora do escopo encontrada contendo [{$fragment}]");
    }
});
