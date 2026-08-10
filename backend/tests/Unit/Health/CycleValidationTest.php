<?php

use Illuminate\Support\Facades\Validator;

uses(Tests\TestCase::class);

test('cycle validation rejects end date before start date', function () {
    $validator = Validator::make([
        'start_date' => '2026-06-05',
        'end_date' => '2026-06-01',
    ], [
        'start_date' => ['required', 'date'],
        'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
    ]);

    expect($validator->fails())->toBeTrue();
});
