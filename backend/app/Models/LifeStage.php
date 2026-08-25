<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LifeStage extends Model
{
    protected $fillable = ['key', 'name', 'description', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function contents(): BelongsToMany
    {
        return $this->belongsToMany(EducationalContent::class, 'content_life_stage')->withTimestamps();
    }
}
