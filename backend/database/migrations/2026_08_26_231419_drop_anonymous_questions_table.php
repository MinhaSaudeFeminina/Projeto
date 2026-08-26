<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('anonymous_questions');

        if (Schema::hasTable('permissions')) {
            DB::table('permissions')->where('key', 'anonymous_questions.manage')->delete();
        }

        $this->updateRolePermissionSnapshots(false);
    }

    public function down(): void
    {
        Schema::create('anonymous_questions', function (Blueprint $table): void {
            $table->id();
            $table->text('question');
            $table->string('category', 120);
            $table->string('status', 30)->default('nova');
            $table->string('priority', 20)->default('media');
            $table->text('answer')->nullable();
            $table->text('internal_notes')->nullable();
            $table->boolean('is_sensitive')->default(false);
            $table->text('search_text_normalized');
            $table->foreignId('answered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('answered_at')->nullable();
            $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'priority', 'created_at']);
        });

        if (Schema::hasTable('permissions')) {
            DB::table('permissions')->updateOrInsert(
                ['key' => 'anonymous_questions.manage'],
                [
                    'name' => 'Gerenciar perguntas anônimas',
                    'description' => 'Gerenciar perguntas anônimas',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }

        $this->updateRolePermissionSnapshots(true);
    }

    private function updateRolePermissionSnapshots(bool $includePermission): void
    {
        if (! Schema::hasTable('admin_roles') || ! Schema::hasColumn('admin_roles', 'permissions')) {
            return;
        }

        DB::table('admin_roles')->get(['id', 'key', 'permissions'])->each(function (object $role) use ($includePermission): void {
            $permissions = json_decode($role->permissions ?? '[]', true) ?: [];
            $permissions = array_values(array_filter(
                $permissions,
                fn (string $permission): bool => $permission !== 'anonymous_questions.manage',
            ));

            if ($includePermission && in_array($role->key, ['reviewer_professor', 'admin'], true)) {
                $permissions[] = 'anonymous_questions.manage';
            }

            DB::table('admin_roles')->where('id', $role->id)->update([
                'permissions' => json_encode(array_values(array_unique($permissions))),
                'updated_at' => now(),
            ]);
        });
    }
};
