<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('educational_contents', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('body');
            $table->foreignId('category_id')->constrained('content_categories');
            $table->foreignId('life_stage_id')->nullable()->constrained('life_stages')->nullOnDelete();
            $table->foreignId('age_range_id')->nullable()->constrained('age_ranges')->nullOnDelete();
            $table->string('status')->default('Rascunho');
            $table->string('review_outcome')->nullable();
            $table->text('review_comment')->nullable();
            $table->foreignId('author_id')->constrained('users');
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('archived_at')->nullable();
            $table->longText('search_text_normalized')->nullable();
            $table->timestamps();
            $table->index(['status', 'published_at']);
            $table->index('search_text_normalized');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educational_contents');
        Schema::dropIfExists('content_categories');
    }
};
