<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Services\Notifications\AdminNotificationRecipientResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('resolve destinatários ativos conforme o evento editorial', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $inactiveReviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $inactiveReviewer->update(['is_active' => false]);
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);
    $content = EducationalContent::create([
        'title' => 'Prevenção e saúde',
        'slug' => 'prevencao-e-saude',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);
    $resolver = app(AdminNotificationRecipientResolver::class);

    expect($resolver->resolve('submitted_for_review', $content, $author)->modelKeys())->toBe([$reviewer->id])
        ->and($resolver->resolve('adjustments_requested', $content, $reviewer)->modelKeys())->toBe([$author->id])
        ->and($resolver->resolve('approved', $content, $reviewer)->modelKeys())->toBe([$admin->id])
        ->and($resolver->resolve('published', $content, $admin)->modelKeys())->toBe([$author->id])
        ->and($resolver->resolve('archived', $content, $admin)->modelKeys())->toBe([$author->id]);
});
