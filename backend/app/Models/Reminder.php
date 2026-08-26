<?php

namespace App\Models;

use App\Services\Search\AccentInsensitiveSearchNormalizer;
use Database\Factories\ReminderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Lembrete de saúde ou campanha divulgada pelo painel administrativo.
 */
class Reminder extends Model
{
    /** @use HasFactory<ReminderFactory> */
    use HasFactory;

    /** Tipos aceitos, espelhando o seletor da tela de lembretes. */
    public const TYPES = [
        'exame_preventivo',
        'mamografia',
        'vacina_hpv',
        'consulta',
        'medicamento',
        'menstruacao',
        'autoexame',
        'campanha',
    ];

    /** Prioridades aceitas, da menor para a maior. */
    public const PRIORITIES = ['baixa', 'media', 'alta', 'urgente'];

    protected $fillable = [
        'title',
        'description',
        'type',
        'priority',
        'audience',
        'periodicity',
        'start_date',
        'end_date',
        'short_message',
        'expanded_message',
        'is_active',
        'title_normalized',
        'created_by',
        'updated_by',
    ];

    /**
     * Mantém a coluna de busca em dia. O projeto compara com `like` sobre texto
     * já normalizado em vez de `unaccent`, que não existe no SQLite dos testes.
     */
    protected static function booted(): void
    {
        static::saving(function (Reminder $reminder): void {
            $reminder->title_normalized = app(AccentInsensitiveSearchNormalizer::class)->normalize($reminder->title);
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'is_active' => 'boolean',
        ];
    }
}
