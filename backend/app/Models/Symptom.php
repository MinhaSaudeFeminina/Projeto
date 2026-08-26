<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Symptom extends Model
{
    protected $fillable = [
        'name',
        'type',
        'short_description',
        'description',
        'icon',
        'category',
        'show_in_app',
        'ask_intensity',
        'ask_notes',
        'is_alert_candidate',
        'orientation_text',
        'severity_alert_text',
        'sort_order',
        'search_text_normalized',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'show_in_app' => 'boolean',
            'ask_intensity' => 'boolean',
            'ask_notes' => 'boolean',
            'is_alert_candidate' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function records(): HasMany
    {
        return $this->hasMany(SymptomRecord::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
