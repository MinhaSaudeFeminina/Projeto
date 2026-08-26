<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LifeStage extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'ubs_orientation',
        'warning_signals',
        'reminder_suggestions',
        'sort_order',
        'is_active',
    ];

    /** Listas vazias por padrão: a tela conta os itens sem checar nulo. */
    protected $attributes = [
        'warning_signals' => '[]',
        'reminder_suggestions' => '[]',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'warning_signals' => 'array',
            'reminder_suggestions' => 'array',
        ];
    }

    public function contents(): BelongsToMany
    {
        return $this->belongsToMany(EducationalContent::class, 'content_life_stage')->withTimestamps();
    }
}
