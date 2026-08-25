<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    protected $fillable = ['type', 'title', 'content', 'version', 'effective_at', 'is_active'];

    protected function casts(): array
    {
        return [
            'effective_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
