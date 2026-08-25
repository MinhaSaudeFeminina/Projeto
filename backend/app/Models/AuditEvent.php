<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'actor_user_id',
        'target_type',
        'target_id',
        'action',
        'previous_state',
        'new_state',
        'metadata_minimal',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata_minimal' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
