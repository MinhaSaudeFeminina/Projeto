<?php

use App\Mail\AdminActionRequiredMail;
use App\Models\AdminNotification;
use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('renderiza e-mail administrativo em UTF-8 sem expor o conteúdo completo', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $category = ContentCategory::create(['name' => 'Saúde íntima', 'slug' => 'saude-intima']);
    $content = EducationalContent::create([
        'title' => 'Saúde íntima e prevenção',
        'slug' => 'saude-intima-e-prevencao',
        'summary' => 'Resumo educativo.',
        'body' => 'Texto editorial completo e confidencial para o portal.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);
    $notification = AdminNotification::create([
        'recipient_id' => $author->id,
        'content_id' => $content->id,
        'type' => 'adjustments_requested',
        'title' => 'Ajustes solicitados no conteúdo',
        'message' => 'Revise a orientação sobre prevenção e saúde íntima no portal.',
        'action_url' => "/conteudos/{$content->id}",
    ]);
    $mail = new AdminActionRequiredMail($notification);

    expect($mail->envelope()->subject)->toBe('Ação necessária: Ajustes solicitados no conteúdo');

    $mail->assertSeeInHtml('Revise a orientação sobre prevenção e saúde íntima no portal.')
        ->assertSeeInHtml('Acessar o portal administrativo')
        ->assertDontSeeInHtml('Texto editorial completo e confidencial para o portal.');
});
