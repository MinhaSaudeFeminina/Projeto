<?php

use App\Services\Search\AccentInsensitiveSearchNormalizer;

it('normaliza acentos, caixa, pontuação e espaços para busca', function (): void {
    $normalizer = new AccentInsensitiveSearchNormalizer;

    expect($normalizer->normalize('  MENSTRUAÇÃO, saúde íntima & prevenção!  '))
        ->toBe('menstruacao saude intima prevencao')
        ->and($normalizer->normalize('Climatério/menopausa'))
        ->toBe('climaterio menopausa');
});
