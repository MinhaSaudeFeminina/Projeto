<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'user_type')) {
                $table->string('user_type')->default('admin_user')->after('password');
            }

            if (! Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('user_type');
            }
        });

        if (! Schema::hasTable('admin_roles')) {
            Schema::create('admin_roles', function (Blueprint $table): void {
                $table->id();
                $table->string('key')->unique();
                $table->string('name')->unique();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('admin_roles', function (Blueprint $table): void {
                if (! Schema::hasColumn('admin_roles', 'key')) {
                    $table->string('key')->nullable()->unique()->after('id');
                }

                if (! Schema::hasColumn('admin_roles', 'description')) {
                    $table->text('description')->nullable()->after('name');
                }
            });
        }

        if (! Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table): void {
                $table->id();
                $table->string('key')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('admin_role_permission')) {
            Schema::create('admin_role_permission', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('admin_role_id')->constrained('admin_roles')->cascadeOnDelete();
                $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['admin_role_id', 'permission_id']);
            });
        }

        if (! Schema::hasTable('admin_role_assignments')) {
            Schema::create('admin_role_assignments', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('admin_role_id')->constrained('admin_roles')->cascadeOnDelete();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->unique(['user_id', 'admin_role_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_role_permission');
        Schema::dropIfExists('permissions');
    }
};
