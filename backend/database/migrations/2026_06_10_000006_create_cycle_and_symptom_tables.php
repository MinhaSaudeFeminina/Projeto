<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menstrual_cycles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('flow_intensity')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'start_date']);
        });

        Schema::create('symptoms', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_alert_candidate')->default(false);
            $table->timestamps();
        });

        Schema::create('symptom_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('symptom_id')->nullable()->constrained('symptoms')->nullOnDelete();
            $table->string('custom_symptom')->nullable();
            $table->unsignedTinyInteger('intensity');
            $table->date('occurred_on');
            $table->text('notes')->nullable();
            $table->boolean('alert_shown')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'occurred_on']);
        });

        Schema::create('cycle_symptom', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('menstrual_cycle_id')->constrained('menstrual_cycles')->cascadeOnDelete();
            $table->foreignId('symptom_record_id')->constrained('symptom_records')->cascadeOnDelete();
            $table->unique(['menstrual_cycle_id', 'symptom_record_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_symptom');
        Schema::dropIfExists('symptom_records');
        Schema::dropIfExists('symptoms');
        Schema::dropIfExists('menstrual_cycles');
    }
};
