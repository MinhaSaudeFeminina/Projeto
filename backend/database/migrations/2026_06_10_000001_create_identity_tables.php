<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('user_type')->default('mobile_user')->after('password');
            $table->boolean('is_active')->default(true)->after('user_type');
        });

        Schema::create('admin_roles', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->json('permissions')->nullable();
            $table->timestamps();
        });

        Schema::create('user_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->date('birth_date');
            $table->unsignedInteger('calculated_age')->nullable();
            $table->foreignId('age_range_id')->nullable();
            $table->foreignId('life_stage_id')->nullable();
            $table->json('privacy_settings')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_role_assignments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('admin_role_id')->constrained('admin_roles')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'admin_role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_role_assignments');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('admin_roles');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['user_type', 'is_active']);
        });
    }
};
