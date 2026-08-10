<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SymptomRecord extends Model
{
    protected $fillable = ['user_id', 'symptom_id', 'custom_symptom', 'intensity', 'occurred_on', 'notes', 'alert_shown'];

    protected function casts(): array
    {
        return [
            'occurred_on' => 'date',
            'alert_shown' => 'boolean',
        ];
    }

    public function symptom(): BelongsTo
    {
        return $this->belongsTo(Symptom::class);
    }
}
