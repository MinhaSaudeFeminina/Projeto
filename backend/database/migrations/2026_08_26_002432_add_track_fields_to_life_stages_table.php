<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Campos da trilha por fase da vida: além de rotular conteúdos, cada fase
     * carrega orientação de UBS, sinais de atenção e sugestões de lembrete.
     */
    public function up(): void
    {
        Schema::table('life_stages', function (Blueprint $table): void {
            if (! Schema::hasColumn('life_stages', 'ubs_orientation')) {
                $table->text('ubs_orientation')->nullable()->after('description');
            }

            if (! Schema::hasColumn('life_stages', 'warning_signals')) {
                $table->json('warning_signals')->default('[]');
            }

            if (! Schema::hasColumn('life_stages', 'reminder_suggestions')) {
                $table->json('reminder_suggestions')->default('[]');
            }
        });
    }

    public function down(): void
    {
        Schema::table('life_stages', function (Blueprint $table): void {
            $table->dropColumn(['ubs_orientation', 'warning_signals', 'reminder_suggestions']);
        });
    }
};
