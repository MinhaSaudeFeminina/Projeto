<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('title_normalized')->index();
            $table->text('description')->nullable();
            $table->string('type', 40);
            $table->string('priority', 20)->default('media');
            $table->string('audience');
            $table->string('periodicity', 80);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('short_message', 160);
            $table->text('expanded_message');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
