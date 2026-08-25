<?php

use Illuminate\Log\Events\MessageLogged;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

uses(RefreshDatabase::class);

test('invalid administrative credentials are omitted from responses and logs', function (): void {
    $password = 'Senha-Super-Secreta-987!';
    $token = 'token-confidencial-123';
    $loggedEntries = [];

    Log::listen(function (MessageLogged $event) use (&$loggedEntries): void {
        $loggedEntries[] = $event->message.' '.json_encode($event->context, JSON_UNESCAPED_UNICODE);
    });

    $response = $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/v1/admin/auth/login', [
            'email' => 'acesso-inexistente@example.com',
            'password' => $password,
        ]);

    $response->assertUnprocessable()
        ->assertJsonMissing([$password, $token]);

    $observableOutput = $response->getContent().' '.implode(' ', $loggedEntries);

    expect($observableOutput)
        ->not->toContain($password)
        ->not->toContain($token);
});
