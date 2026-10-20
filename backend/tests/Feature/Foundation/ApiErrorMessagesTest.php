<?php

use App\Models\AdminRole;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

it('answers unauthenticated requests in Portuguese', function (): void {
    $this
        ->getJson('/api/v1/admin/contents')
        ->assertUnauthorized()
        ->assertExactJson(['message' => 'Sua sessão expirou. Entre novamente.']);
});

it('translates validation messages and field names', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $this
        ->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/contents', [])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'O campo título é obrigatório.')
        ->assertJsonPath('errors.summary.0', 'O campo resumo é obrigatório.');
});

it('hides the model and route behind a not found message', function (): void {
    $admin = adminUserWithCanonicalRole(AdminRole::ADMIN);

    $this
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/contents/999999')
        ->assertNotFound()
        ->assertExactJson(['message' => 'O registro solicitado não foi encontrado. Ele pode ter sido removido.']);

    $this
        ->getJson('/api/v1/rota-que-nao-existe')
        ->assertNotFound()
        ->assertExactJson(['message' => 'O registro solicitado não foi encontrado. Ele pode ter sido removido.']);
});

it('keeps the Portuguese message passed to abort', function (): void {
    Route::get('/api/v1/teste-abort', fn () => abort(403, 'Perfil administrativo sem permissão para esta ação.'));

    $this
        ->getJson('/api/v1/teste-abort')
        ->assertForbidden()
        ->assertExactJson(['message' => 'Perfil administrativo sem permissão para esta ação.']);
});

it('replaces framework authorization text', function (): void {
    Route::get('/api/v1/teste-negado', fn () => throw new AuthorizationException);

    $this
        ->getJson('/api/v1/teste-negado')
        ->assertForbidden()
        ->assertExactJson(['message' => 'Você não tem permissão para realizar esta ação.']);
});

it('never exposes internal errors to the user', function (): void {
    config(['app.debug' => false]);
    Route::get('/api/v1/teste-falha', fn () => throw new RuntimeException('SQLSTATE[23505]: Unique violation'));

    $this
        ->getJson('/api/v1/teste-falha')
        ->assertInternalServerError()
        ->assertExactJson(['message' => 'Ocorreu um erro inesperado. Tente novamente em instantes.']);
});
