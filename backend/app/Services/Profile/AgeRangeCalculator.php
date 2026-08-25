<?php

namespace App\Services\Profile;

use App\Models\AgeRange;
use Carbon\CarbonImmutable;

class AgeRangeCalculator
{
    public function ageFromBirthDate(string $birthDate): int
    {
        return CarbonImmutable::parse($birthDate)->age;
    }

    public function rangeForBirthDate(string $birthDate): ?AgeRange
    {
        $age = $this->ageFromBirthDate($birthDate);

        return AgeRange::query()
            ->where('min_age', '<=', $age)
            ->where(function ($query) use ($age): void {
                $query->whereNull('max_age')->orWhere('max_age', '>=', $age);
            })
            ->orderBy('min_age')
            ->first();
    }
}
