<?php

use App\Models\AgeRange;
use App\Services\Profile\AgeRangeCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

test('calculates age range from birth date', function () {
    AgeRange::create(['label' => '20-29', 'min_age' => 20, 'max_age' => 29]);

    $birthDate = now()->subYears(25)->toDateString();
    $range = app(AgeRangeCalculator::class)->rangeForBirthDate($birthDate);

    expect($range?->label)->toBe('20-29');
});
