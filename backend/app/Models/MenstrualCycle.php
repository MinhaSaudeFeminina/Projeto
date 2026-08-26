<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenstrualCycle extends Model
{
    protected $fillable = ['user_id', 'start_date', 'end_date', 'flow_intensity', 'notes'];

    protected function casts(): array
    {
        return [
            // Serialized as plain dates: the API contract is a calendar day,
            // not a moment in time, and clients compare them as strings.
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    public function symptoms(): BelongsToMany
    {
        return $this->belongsToMany(SymptomRecord::class, 'cycle_symptom');
    }
}
