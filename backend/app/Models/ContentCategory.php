<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContentCategory extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'sort_order', 'is_active', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function contents(): HasMany
    {
        return $this->hasMany(EducationalContent::class, 'category_id');
    }
}
