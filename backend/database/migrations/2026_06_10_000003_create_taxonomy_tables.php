<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('age_ranges', function (Blueprint $table): void {
            $table->id();
            $table->string('label')->unique();
            $table->unsignedInteger('min_age');
            $table->unsignedInteger('max_age')->nullable();
            $table->timestamps();
        });

        Schema::create('life_stages', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('life_stages');
        Schema::dropIfExists('age_ranges');
    }
};
