<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A trilha deixa de ser só um rótulo de taxonomia: passa a ter faixa etária,
     * situação editorial própria e conteúdos vinculados em ordem.
     */
    public function up(): void
    {
        Schema::table('life_stages', function (Blueprint $table): void {
            if (! Schema::hasColumn('life_stages', 'status')) {
                $table->string('status', 20)->default('draft')->index();
            }

            if (! Schema::hasColumn('life_stages', 'age_range_id')) {
                $table->foreignId('age_range_id')->nullable()->constrained('age_ranges')->nullOnDelete();
            }

            if (! Schema::hasColumn('life_stages', 'published_by')) {
                $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('life_stages', 'published_at')) {
                $table->timestamp('published_at')->nullable();
            }
        });

        // As fases semeadas já respondem ao app, então nascem publicadas em vez
        // de sumirem de lá no dia da migração.
        DB::table('life_stages')->where('is_active', true)->update(['status' => 'published']);

        Schema::table('content_life_stage', function (Blueprint $table): void {
            if (! Schema::hasColumn('content_life_stage', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(0);
                $table->index(['life_stage_id', 'sort_order'], 'content_life_stage_order_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('content_life_stage', function (Blueprint $table): void {
            $table->dropIndex('content_life_stage_order_index');
            $table->dropColumn('sort_order');
        });

        Schema::table('life_stages', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('age_range_id');
            $table->dropConstrainedForeignId('published_by');
            $table->dropColumn(['status', 'published_at']);
        });
    }
};
