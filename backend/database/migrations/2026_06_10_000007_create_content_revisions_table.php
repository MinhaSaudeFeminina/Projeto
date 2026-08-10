<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_revisions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('content_id')->constrained('educational_contents')->cascadeOnDelete();
            $table->foreignId('changed_by')->constrained('users');
            $table->string('title');
            $table->text('summary');
            $table->longText('body');
            $table->string('status');
            $table->text('change_note')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['content_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_revisions');
    }
};
