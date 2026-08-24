<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use App\Services\Content\EditorialWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

it('rejects an editorial transition from an unexpected state', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Saúde mental', 'slug' => 'saude-mental']);
    $content = EducationalContent::create([
        'title' => 'Acolhimento e saúde mental',
        'slug' => 'acolhimento-e-saude-mental',
        'summary' => 'Resumo educativo.',
        'body' => 'Conteúdo educativo e não diagnóstico.',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $author->id,
    ]);

    expect(fn () => app(EditorialWorkflowService::class)->approve($content, $reviewer))
        ->toThrow(ValidationException::class, 'Estado editorial inválido');

    expect($content->fresh()->status)->toBe(EducationalContent::DRAFT);
});

it('records reviewer metadata when approving content', function (): void {
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $reviewer = adminUserWithCanonicalRole(AdminRole::REVIEWER);
    $category = ContentCategory::create(['name' => 'Gestação', 'slug' => 'gestacao']);
    $content = EducationalContent::create([
        'title' => 'Cuidados na gestação',
        'slug' => 'cuidados-na-gestacao',
        'summary' => 'Resumo educativo.',
        'body' => 'Procure acompanhamento profissional.',
        'category_id' => $category->id,
        'status' => EducationalContent::IN_REVIEW,
        'author_id' => $author->id,
    ]);

    $approved = app(EditorialWorkflowService::class)->approve($content, $reviewer, 'Revisão concluída.');

    expect($approved->status)->toBe(EducationalContent::APPROVED)
        ->and($approved->reviewed_by)->toBe($reviewer->id)
        ->and($approved->approved_by)->toBe($reviewer->id)
        ->and($approved->approved_at)->not->toBeNull();
});
