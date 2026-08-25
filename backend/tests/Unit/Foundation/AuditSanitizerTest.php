<?php

use App\Services\Audit\AuditSanitizer;

test('removes sensitive metadata from audit payloads', function () {
    $sanitized = (new AuditSanitizer())->sanitize([
        'action' => 'updated',
        'notes' => 'dor íntima',
        'nested' => ['password' => 'secret'],
    ]);

    expect($sanitized['notes'])->toBe('[omitido]')
        ->and($sanitized['nested']['password'])->toBe('[omitido]')
        ->and($sanitized['action'])->toBe('updated');
});
