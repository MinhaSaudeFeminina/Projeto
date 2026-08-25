<?php

use App\Services\Audit\AuditSanitizer;

it('removes tokens passwords and excessive payloads from audit metadata', function (): void {
    $sanitized = app(AuditSanitizer::class)->sanitize([
        'title' => 'Saúde e prevenção',
        'password' => 'secret',
        'access_token' => 'token-value',
        'authorization_header' => 'Bearer abc',
        'payload' => ['body' => 'Texto completo sensível', 'safe' => 'ok'],
        'nested' => ['remember_token' => 'abc', 'event' => 'approved'],
    ]);

    expect($sanitized['title'])->toBe('Saúde e prevenção')
        ->and($sanitized['password'])->toBe('[omitido]')
        ->and($sanitized['access_token'])->toBe('[omitido]')
        ->and($sanitized['authorization_header'])->toBe('[omitido]')
        ->and($sanitized['payload'])->toBe('[omitido]')
        ->and($sanitized['nested']['remember_token'])->toBe('[omitido]')
        ->and($sanitized['nested']['event'])->toBe('approved');
});
