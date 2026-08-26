<?php

namespace Database\Seeders;

use App\Models\LegalDocument;
use App\Models\User;
use App\Services\Profile\AgeRangeCalculator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * A ready-to-use app account for development. It mirrors what
 * Mobile\AuthController::register does, including the legal acceptances that
 * CurrentLegalAcceptanceGate requires for full access.
 *
 * Runs after LegalDocumentSeeder and ContentTaxonomySeeder, which provide the
 * documents and the age ranges this depends on.
 */
class MobileUserSeeder extends Seeder
{
    private const BIRTH_DATE = '1996-04-18';

    public function run(AgeRangeCalculator $calculator): void
    {
        $user = User::updateOrCreate(
            ['email' => 'maria@example.com'],
            [
                'name' => 'Maria',
                'password' => Hash::make('password'),
                'user_type' => 'mobile_user',
                'is_active' => true,
            ],
        );

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'birth_date' => self::BIRTH_DATE,
                'calculated_age' => $calculator->ageFromBirthDate(self::BIRTH_DATE),
                'age_range_id' => $calculator->rangeForBirthDate(self::BIRTH_DATE)?->id,
                'life_stage_id' => null,
                'privacy_settings' => ['push_discreet' => true],
            ],
        );

        LegalDocument::query()
            ->where('is_active', true)
            ->whereIn('type', ['terms', 'privacy_policy'])
            ->get()
            ->each(fn (LegalDocument $document) => DB::table('legal_acceptances')->updateOrInsert([
                'user_id' => $user->id,
                'legal_document_id' => $document->id,
            ], [
                'accepted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]));
    }
}
