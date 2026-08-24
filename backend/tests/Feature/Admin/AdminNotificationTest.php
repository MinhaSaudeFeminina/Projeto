<?php

use App\Mail\AdminActionRequiredMail;
use App\Models\AdminNotification;
use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

it('cria notificações editoriais, lista apenas as próprias e permite marcá-las como lidas', function (): void {
    Mail::fake();
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $otherReviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);
    $content = EducationalContent::create([
        'title' => 'Saúde íntima e prevenção',
        'slug' => 'saude-intima-e-prevencao',
        'summary' => 'Resumo educativo.',
        'body' => 'Corpo editorial que não deve aparecer na notificação.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);

    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/submit-review")
        ->assertOk();

    $this->assertDatabaseHas('admin_notifications', [
        'recipient_id' => $reviewer->id,
        'content_id' => $content->id,
        'type' => 'submitted_for_review',
        'title' => 'Conteúdo enviado para revisão',
    ]);
    $this->assertDatabaseHas('admin_notifications', [
        'recipient_id' => $otherReviewer->id,
        'content_id' => $content->id,
        'type' => 'submitted_for_review',
    ]);
    expect(AdminNotification::query()->where('message', 'like', '%Corpo editorial%')->exists())->toBeFalse();
    Mail::assertSent(AdminActionRequiredMail::class, 2);

    $notification = AdminNotification::query()->where('recipient_id', $reviewer->id)->firstOrFail();

    $this->actingAs($reviewer, 'sanctum')
        ->getJson('/api/v1/admin/notifications')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $notification->id)
        ->assertJsonPath('meta.unread_count', 1);

    $this->actingAs($otherReviewer, 'sanctum')
        ->postJson("/api/v1/admin/notifications/{$notification->id}/read")
        ->assertForbidden();

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/notifications/{$notification->id}/read")
        ->assertNoContent();

    expect($notification->fresh()->read_at)->not->toBeNull();

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/request-adjustments", [
            'comment' => 'Revisar orientação sobre prevenção e saúde íntima.',
        ])
        ->assertOk();
    $this->actingAs($author, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/submit-review")
        ->assertOk();
    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/approve", [
            'comment' => 'Conteúdo revisado e aprovado.',
        ])
        ->assertOk();
    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/publish")
        ->assertOk();
    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/contents/{$content->id}/archive")
        ->assertOk();

    $this->assertDatabaseHas('admin_notifications', [
        'recipient_id' => $author->id,
        'type' => 'adjustments_requested',
    ]);
    $this->assertDatabaseHas('admin_notifications', [
        'recipient_id' => $admin->id,
        'type' => 'approved',
    ]);
    $this->assertDatabaseHas('admin_notifications', [
        'recipient_id' => $author->id,
        'type' => 'published',
    ]);
    $this->assertDatabaseHas('admin_notifications', [
        'recipient_id' => $author->id,
        'type' => 'archived',
    ]);
    Mail::assertSent(AdminActionRequiredMail::class, 8);
});
