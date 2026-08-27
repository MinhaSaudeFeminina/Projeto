<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'birth_date',
        'calculated_age',
        'age_range_id',
        'life_stage_id',
        'privacy_settings',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'privacy_settings' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lifeStage(): BelongsTo
    {
        return $this->belongsTo(LifeStage::class);
    }

    public function ageRange(): BelongsTo
    {
        return $this->belongsTo(AgeRange::class);
    }
}
