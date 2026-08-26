<?php

/**
 * The container exports DB_* so the entrypoint can mirror them into .env, but
 * that also puts them in $_SERVER, which Laravel's env repository reads before
 * anything phpunit.xml sets. Without this the suite would run RefreshDatabase
 * against the development database and wipe it.
 */
$testDatabase = [
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => ':memory:',
    'DB_URL' => '',
];

foreach ($testDatabase as $key => $value) {
    $_SERVER[$key] = $value;
    $_ENV[$key] = $value;
    putenv("{$key}={$value}");
}

require __DIR__.'/../vendor/autoload.php';
