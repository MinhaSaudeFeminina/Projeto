<?php

namespace App\Services\Search;

use Illuminate\Support\Str;

class AccentInsensitiveSearchNormalizer
{
    public function normalize(string $value): string
    {
        return Str::of($value)
            ->ascii('pt')
            ->lower()
            ->replaceMatches('/[^a-z0-9\s]/', ' ')
            ->replaceMatches('/\s+/', ' ')
            ->trim()
            ->toString();
    }
}
