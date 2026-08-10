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
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function symptoms(): BelongsToMany
    {
        return $this->belongsToMany(SymptomRecord::class, 'cycle_symptom');
    }
}
