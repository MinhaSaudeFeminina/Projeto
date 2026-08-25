<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentRevision extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'content_id',
        'changed_by',
        'version',
        'title_snapshot',
        'summary_snapshot',
        'body_snapshot',
        'category_snapshot',
        'life_stages_snapshot',
        'age_ranges_snapshot',
        'status_snapshot',
        'change_summary',
        'title',
        'summary',
        'body',
        'status',
        'change_note',
    ];

    protected function casts(): array
    {
        return [
            'category_snapshot' => 'array',
            'life_stages_snapshot' => 'array',
            'age_ranges_snapshot' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(EducationalContent::class, 'content_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
