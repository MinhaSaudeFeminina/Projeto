<?php

declare(strict_types=1);

use App\Rules\AllowedHealthTopic;

test('rejects excluded health topics', function (string $value): void {
    $failed = false;

    (new AllowedHealthTopic)->validate('field', $value, function () use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeTrue();
})->with([
    'gestação' => 'Cuidados na gestação',
    'puerpério' => 'Bem-estar no puerpério',
    'pré-natal' => 'Consulta pré-natal',
    'fertilidade' => 'Orientações sobre fertilidade',
]);

test('allows unrelated health topics', function (): void {
    $failed = false;

    (new AllowedHealthTopic)->validate('field', 'Saúde íntima e prevenção', function () use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeFalse();
});
