<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('educational_contents')) {
            Schema::create('educational_contents', function (Blueprint $table): void {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('summary');
                $table->longText('body');
                $table->foreignId('category_id')->nullable()->constrained('content_categories')->nullOnDelete();
                $table->string('status')->default('draft');
                $table->foreignId('author_id')->constrained('users');
                $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('submitted_at')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('published_at')->nullable();
                $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('archived_at')->nullable();
                $table->longText('search_text_normalized')->nullable();
                $table->timestamps();
                $table->index(['status', 'published_at']);
            });
        } else {
            Schema::table('educational_contents', function (Blueprint $table): void {
                foreach ([
                    'submitted_by' => 'users',
                    'reviewed_by' => 'users',
                ] as $column => $target) {
                    if (! Schema::hasColumn('educational_contents', $column)) {
                        $table->foreignId($column)->nullable()->constrained($target)->nullOnDelete();
                    }
                }

                foreach (['submitted_at', 'reviewed_at'] as $column) {
                    if (! Schema::hasColumn('educational_contents', $column)) {
                        $table->timestamp($column)->nullable();
                    }
                }
            });
        }

        if (! Schema::hasTable('content_life_stage')) {
            Schema::create('content_life_stage', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('educational_content_id')->constrained('educational_contents')->cascadeOnDelete();
                $table->foreignId('life_stage_id')->constrained('life_stages')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['educational_content_id', 'life_stage_id'], 'content_life_stage_unique');
            });
        }

        if (! Schema::hasTable('age_range_content')) {
            Schema::create('age_range_content', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('educational_content_id')->constrained('educational_contents')->cascadeOnDelete();
                $table->foreignId('age_range_id')->constrained('age_ranges')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['educational_content_id', 'age_range_id'], 'age_range_content_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('age_range_content');
        Schema::dropIfExists('content_life_stage');
    }
};
