<?php

use App\Services\Content\AccentInsensitiveSearchNormalizer;

test('content search normalization preserves source text responsibility', function () {
    $normalizer = new AccentInsensitiveSearchNormalizer();

    expect($normalizer->normalize('menstruação e saúde íntima'))->toBe('menstruacao e saude intima');
});
