<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('content_categories')) {
            Schema::create('content_categories', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        } else {
            Schema::table('content_categories', function (Blueprint $table): void {
                if (! Schema::hasColumn('content_categories', 'created_by')) {
                    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                }

                if (! Schema::hasColumn('content_categories', 'updated_by')) {
                    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                }
            });
        }

        if (! Schema::hasTable('life_stages')) {
            Schema::create('life_stages', function (Blueprint $table): void {
                $table->id();
                $table->string('key')->unique();
                $table->string('name')->unique();
                $table->text('description')->nullable();
                $table->unsignedInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            Schema::table('life_stages', function (Blueprint $table): void {
                if (! Schema::hasColumn('life_stages', 'key')) {
                    $table->string('key')->nullable()->unique()->after('id');
                }

                if (! Schema::hasColumn('life_stages', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
            });
        }

        if (! Schema::hasTable('age_ranges')) {
            Schema::create('age_ranges', function (Blueprint $table): void {
                $table->id();
                $table->string('label')->unique();
                $table->unsignedInteger('min_age');
                $table->unsignedInteger('max_age')->nullable();
                $table->unsignedInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            Schema::table('age_ranges', function (Blueprint $table): void {
                if (! Schema::hasColumn('age_ranges', 'sort_order')) {
                    $table->unsignedInteger('sort_order')->default(0);
                }

                if (! Schema::hasColumn('age_ranges', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
            });
        }
    }

    public function down(): void
    {
        //
    }
};
