<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('admin_notifications')) {
            Schema::create('admin_notifications', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('content_id')->nullable()->constrained('educational_contents')->nullOnDelete();
                $table->string('type');
                $table->string('title');
                $table->text('message');
                $table->string('action_url')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamp('email_sent_at')->nullable();
                $table->timestamp('email_failed_at')->nullable();
                $table->timestamps();
                $table->index(['recipient_id', 'read_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};
