<?php

use Illuminate\Routing\Route;

/**
 * @return array<string, true>
 */
function documentedAdminOperations(): array
{
    $contract = file_get_contents(base_path('../specs/001-minha-saude-feminina/contracts/openapi.yaml'));

    expect($contract)->not->toBeFalse();

    $operations = [];
    $path = null;

    foreach (preg_split('/\R/', (string) $contract) as $line) {
        if (preg_match('/^  (\/[^:]+):$/', $line, $matches) === 1) {
            $path = $matches[1];

            continue;
        }

        if ($path !== null && preg_match('/^    (get|post|put|patch|delete):$/', $line, $matches) === 1) {
            $operations[strtoupper($matches[1]).' '.$path] = true;
        }
    }

    return $operations;
}

function normalizedAdminPath(Route $route): string
{
    $path = preg_replace('#^api/v1/admin#', '', $route->uri());

    return preg_replace('/\{[^}]+\}/', '{id}', (string) $path);
}

test('every active administrative API route is documented in OpenAPI', function (): void {
    $documented = documentedAdminOperations();
    $missing = [];

    foreach (app('router')->getRoutes() as $route) {
        if (! str_starts_with($route->uri(), 'api/v1/admin')) {
            continue;
        }

        foreach (array_diff($route->methods(), ['HEAD', 'OPTIONS']) as $method) {
            $operation = $method.' '.normalizedAdminPath($route);

            if (! isset($documented[$operation])) {
                $missing[] = $operation;
            }
        }
    }

    expect($missing)->toBe([], 'Rotas administrativas sem cobertura no OpenAPI: '.implode(', ', $missing));
});
