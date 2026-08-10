<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('content_revisions')) {
            Schema::create('content_revisions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('content_id')->constrained('educational_contents')->cascadeOnDelete();
                $table->foreignId('changed_by')->constrained('users');
                $table->unsignedInteger('version')->default(1);
                $table->string('title_snapshot');
                $table->text('summary_snapshot')->nullable();
                $table->longText('body_snapshot');
                $table->json('category_snapshot')->nullable();
                $table->json('life_stages_snapshot')->nullable();
                $table->json('age_ranges_snapshot')->nullable();
                $table->string('status_snapshot');
                $table->text('change_summary')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->index(['content_id', 'version']);
            });
        } else {
            Schema::table('content_revisions', function (Blueprint $table): void {
                if (! Schema::hasColumn('content_revisions', 'version')) {
                    $table->unsignedInteger('version')->default(1);
                }
                if (! Schema::hasColumn('content_revisions', 'title_snapshot')) {
                    $table->string('title_snapshot')->nullable();
                }
                if (! Schema::hasColumn('content_revisions', 'summary_snapshot')) {
                    $table->text('summary_snapshot')->nullable();
                }
                if (! Schema::hasColumn('content_revisions', 'body_snapshot')) {
                    $table->longText('body_snapshot')->nullable();
                }
                if (! Schema::hasColumn('content_revisions', 'status_snapshot')) {
                    $table->string('status_snapshot')->nullable();
                }
                if (! Schema::hasColumn('content_revisions', 'change_summary')) {
                    $table->text('change_summary')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        //
    }
};
