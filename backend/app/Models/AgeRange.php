<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AgeRange extends Model
{
    protected $fillable = ['label', 'min_age', 'max_age', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'min_age' => 'integer',
            'max_age' => 'integer',
        ];
    }

    public function contents(): BelongsToMany
    {
        return $this->belongsToMany(EducationalContent::class, 'age_range_content')->withTimestamps();
    }
}
