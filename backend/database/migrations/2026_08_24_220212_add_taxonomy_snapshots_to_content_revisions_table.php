<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('content_revisions', function (Blueprint $table): void {
            if (! Schema::hasColumn('content_revisions', 'category_snapshot')) {
                $table->json('category_snapshot')->nullable()->after('body_snapshot');
            }

            if (! Schema::hasColumn('content_revisions', 'life_stages_snapshot')) {
                $table->json('life_stages_snapshot')->nullable()->after('category_snapshot');
            }

            if (! Schema::hasColumn('content_revisions', 'age_ranges_snapshot')) {
                $table->json('age_ranges_snapshot')->nullable()->after('life_stages_snapshot');
            }
        });
    }

    public function down(): void
    {
        Schema::table('content_revisions', function (Blueprint $table): void {
            if (Schema::hasColumn('content_revisions', 'age_ranges_snapshot')) {
                $table->dropColumn('age_ranges_snapshot');
            }

            if (Schema::hasColumn('content_revisions', 'life_stages_snapshot')) {
                $table->dropColumn('life_stages_snapshot');
            }

            if (Schema::hasColumn('content_revisions', 'category_snapshot')) {
                $table->dropColumn('category_snapshot');
            }
        });
    }
};
