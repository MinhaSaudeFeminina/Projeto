<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportContact extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'phone',
        'link',
        'cta_label',
        'sort_order',
        'is_highlighted',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_highlighted' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
