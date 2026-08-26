<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('symptoms', function (Blueprint $table): void {
            $table->string('type', 60)->default('outro');
            $table->string('short_description', 255)->nullable();
            $table->string('icon', 80)->nullable();
            $table->string('category', 120)->default('Geral');
            $table->boolean('show_in_app')->default(true);
            $table->boolean('ask_intensity')->default(true);
            $table->boolean('ask_notes')->default(true);
            $table->text('orientation_text')->nullable();
            $table->text('severity_alert_text')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->text('search_text_normalized')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->index(['show_in_app', 'sort_order']);
            $table->index(['category', 'type']);
        });

        foreach (DB::table('symptoms')->select(['id', 'name', 'description'])->get() as $symptom) {
            $searchText = Str::of($symptom->name.' '.($symptom->description ?? ''))
                ->ascii('pt')
                ->lower()
                ->replaceMatches('/[^a-z0-9\s]/', ' ')
                ->replaceMatches('/\s+/', ' ')
                ->trim()
                ->toString();

            DB::table('symptoms')->where('id', $symptom->id)->update([
                'search_text_normalized' => $searchText,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('symptoms', function (Blueprint $table): void {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropIndex(['show_in_app', 'sort_order']);
            $table->dropIndex(['category', 'type']);
            $table->dropColumn([
                'type',
                'short_description',
                'icon',
                'category',
                'show_in_app',
                'ask_intensity',
                'ask_notes',
                'orientation_text',
                'severity_alert_text',
                'sort_order',
                'search_text_normalized',
                'created_by',
                'updated_by',
            ]);
        });
    }
};
