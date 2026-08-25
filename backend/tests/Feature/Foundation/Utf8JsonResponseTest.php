<?php

use Illuminate\Support\Facades\Route;

it('returns admin JSON without escaping Portuguese accents', function (): void {
    Route::get('/api/teste-utf8-admin', fn () => response()->json([
        'message' => 'Ação concluída com acentuação, cedilha e prevenção.',
    ], 200, [], JSON_UNESCAPED_UNICODE));

    $response = $this->getJson('/api/teste-utf8-admin');

    $response->assertOk();
    expect($response->getContent())->toContain('Ação concluída')
        ->and($response->getContent())->toContain('cedilha')
        ->and($response->getContent())->not->toContain('\u00e7');
});
