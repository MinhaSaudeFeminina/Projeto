<?php

use App\Support\ApiErrorMessage;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin.role' => \App\Http\Middleware\EnsureAdminRole::class,
            'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
            'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request): ?string {
            return $request->is('api/*') ? null : '/login';
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e): bool {
            return $request->is('api/*') || $request->expectsJson();
        });

        // The panel and the app show `message` as-is, so API errors always carry
        // a Portuguese sentence meant for the end user, never framework text.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($e instanceof HttpResponseException) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return response()->json([
                    'message' => collect($e->errors())->flatten()->first() ?? 'Confira os dados informados.',
                    'errors' => $e->errors(),
                ], $e->status);
            }

            if ($e instanceof AuthenticationException) {
                return response()->json(['message' => 'Sua sessão expirou. Entre novamente.'], 401);
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
            $message = ApiErrorMessage::for($status, $e instanceof HttpExceptionInterface ? $e->getMessage() : '');

            $payload = ['message' => $message];

            if ($status >= 500 && config('app.debug')) {
                $payload['debug'] = ['exception' => $e::class, 'message' => $e->getMessage()];
            }

            $headers = $e instanceof HttpExceptionInterface ? $e->getHeaders() : [];

            return response()->json($payload, $status, $headers);
        });
    })->create();

if (getenv('APP_ENV') === 'testing' && ! is_file(dirname(__DIR__).'/.env')) {
    $app->loadEnvironmentFrom('.env.example');
}

return $app;
