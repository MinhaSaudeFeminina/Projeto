<?php

namespace App\Services\Audit;

class AuditSanitizer
{
    private const REDACTED = '[omitido]';

    private const SENSITIVE_FRAGMENTS = [
        'password',
        'senha',
        'token',
        'secret',
        'authorization',
        'cookie',
        'remember_token',
        'api_key',
    ];

    private const LARGE_TEXT_KEYS = [
        'body',
        'content',
        'notes',
        'payload',
        'html',
    ];

    public function sanitize(array $metadata): array
    {
        $sanitized = [];

        foreach ($metadata as $key => $value) {
            $keyString = mb_strtolower((string) $key);

            if ($this->isSensitiveKey($keyString) || in_array($keyString, self::LARGE_TEXT_KEYS, true)) {
                $sanitized[$key] = self::REDACTED;
                continue;
            }

            $sanitized[$key] = is_array($value) ? $this->sanitize($value) : $value;
        }

        return $sanitized;
    }

    private function isSensitiveKey(string $key): bool
    {
        foreach (self::SENSITIVE_FRAGMENTS as $fragment) {
            if (str_contains($key, $fragment)) {
                return true;
            }
        }

        return false;
    }
}
