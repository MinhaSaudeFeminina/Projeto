<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationalContent extends Model
{
    public const DRAFT = 'draft';
    public const IN_REVIEW = 'in_review';
    public const APPROVED = 'approved';
    public const PUBLISHED = 'published';
    public const ARCHIVED = 'archived';

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'body',
        'category_id',
        'life_stage_id',
        'age_range_id',
        'status',
        'author_id',
        'submitted_by',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'published_by',
        'published_at',
        'archived_by',
        'archived_at',
        'search_text_normalized',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ContentCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function lifeStages(): BelongsToMany
    {
        return $this->belongsToMany(LifeStage::class, 'content_life_stage')->withTimestamps();
    }

    public function ageRanges(): BelongsToMany
    {
        return $this->belongsToMany(AgeRange::class, 'age_range_content')->withTimestamps();
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(ContentRevision::class, 'content_id');
    }

    public function auditEvents(): HasMany
    {
        return $this->hasMany(EditorialAuditEvent::class, 'content_id');
    }
}
