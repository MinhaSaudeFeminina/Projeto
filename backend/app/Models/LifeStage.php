<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Trilha por fase da vida: agrupa conteúdos em ordem para uma faixa etária e só
 * chega ao app depois de publicada.
 */
class LifeStage extends Model
{
    public const DRAFT = 'draft';
    public const PUBLISHED = 'published';
    public const ARCHIVED = 'archived';

    /** @var list<string> */
    public const STATUSES = [self::DRAFT, self::PUBLISHED, self::ARCHIVED];

    protected $fillable = [
        'key',
        'name',
        'description',
        'ubs_orientation',
        'warning_signals',
        'reminder_suggestions',
        'age_range_id',
        'status',
        'published_by',
        'published_at',
        'sort_order',
        'is_active',
    ];

    /** Listas vazias por padrão: a tela conta os itens sem checar nulo. */
    protected $attributes = [
        'warning_signals' => '[]',
        'reminder_suggestions' => '[]',
        'status' => self::DRAFT,
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'published_at' => 'datetime',
            'warning_signals' => 'array',
            'reminder_suggestions' => 'array',
        ];
    }

    /**
     * A ordem do vínculo é escolhida na tela de trilhas, então toda leitura já
     * sai na sequência em que a usuária deve percorrer os conteúdos.
     */
    public function contents(): BelongsToMany
    {
        return $this->belongsToMany(EducationalContent::class, 'content_life_stage')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order')
            ->orderBy('educational_contents.title');
    }

    public function ageRange(): BelongsTo
    {
        return $this->belongsTo(AgeRange::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    /** @param  Builder<LifeStage>  $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', self::PUBLISHED);
    }
}
