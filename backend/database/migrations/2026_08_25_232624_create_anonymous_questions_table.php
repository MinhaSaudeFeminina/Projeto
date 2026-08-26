<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('anonymous_questions', function (Blueprint $table): void {
            $table->id();
            $table->text('question');
            $table->string('category', 120);
            $table->string('status', 30)->default('nova');
            $table->string('priority', 20)->default('media');
            $table->text('answer')->nullable();
            $table->text('internal_notes')->nullable();
            $table->boolean('is_sensitive')->default(false);
            $table->text('search_text_normalized');
            $table->foreignId('answered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('answered_at')->nullable();
            $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'priority', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anonymous_questions');
    }
};
