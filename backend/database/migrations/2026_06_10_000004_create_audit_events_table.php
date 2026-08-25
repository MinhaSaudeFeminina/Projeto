<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('target_type');
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('action');
            $table->string('previous_state')->nullable();
            $table->string('new_state')->nullable();
            $table->json('metadata_minimal')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['target_type', 'target_id']);
            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_events');
    }
};
