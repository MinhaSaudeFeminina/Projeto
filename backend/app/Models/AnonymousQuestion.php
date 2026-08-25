<?php

namespace App\Models;

use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Database\Factories\AnonymousQuestionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnonymousQuestion extends Model
{
    public const NEW = 'nova';

    public const IN_REVIEW = 'em_analise';

    public const ANSWERED = 'respondida';

    public const ARCHIVED = 'arquivada';

    public const LOW_PRIORITY = 'baixa';

    public const MEDIUM_PRIORITY = 'media';

    public const HIGH_PRIORITY = 'alta';

    public const URGENT_PRIORITY = 'urgente';

    /** @use HasFactory<AnonymousQuestionFactory> */
    use HasFactory;

    protected $fillable = [
        'question',
        'category',
        'status',
        'priority',
        'answer',
        'internal_notes',
        'is_sensitive',
        'search_text_normalized',
        'answered_by',
        'answered_at',
        'archived_by',
        'archived_at',
    ];

    protected static function booted(): void
    {
        static::saving(function (AnonymousQuestion $question): void {
            $question->search_text_normalized = app(AccentInsensitiveSearchNormalizer::class)
                ->normalize("{$question->question} {$question->category}");
        });
    }

    protected function casts(): array
    {
        return [
            'is_sensitive' => 'boolean',
            'answered_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function answeredByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'answered_by');
    }

    public function archivedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by');
    }
}
