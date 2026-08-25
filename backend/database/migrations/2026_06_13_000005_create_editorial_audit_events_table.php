<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('editorial_audit_events')) {
            Schema::create('editorial_audit_events', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('content_id')->nullable()->constrained('educational_contents')->cascadeOnDelete();
                $table->foreignId('target_admin_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('action');
                $table->string('previous_status')->nullable();
                $table->string('new_status')->nullable();
                $table->text('comment')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('occurred_at')->useCurrent();
                $table->index(['content_id', 'occurred_at']);
                $table->index(['action', 'occurred_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('editorial_audit_events');
    }
};
