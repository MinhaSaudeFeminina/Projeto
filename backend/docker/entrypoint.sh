#!/bin/sh
set -e

cd /var/www/html

[ -f .env ] || cp .env.example .env

set_env() {
    if grep -qE "^${1}=" .env; then
        sed -i "s|^${1}=.*|${1}=${2}|" .env
    else
        printf '%s=%s\n' "$1" "$2" >> .env
    fi
}

# `artisan serve` only forwards an allowlist of variables to the PHP worker
# process, so the container's DB settings must live in .env to reach requests.
set_env DB_CONNECTION "${DB_CONNECTION}"
set_env DB_HOST "${DB_HOST}"
set_env DB_PORT "${DB_PORT}"
set_env DB_DATABASE "${DB_DATABASE}"
set_env DB_USERNAME "${DB_USERNAME}"
set_env DB_PASSWORD "${DB_PASSWORD}"

grep -q '^APP_KEY=.\+' .env || php artisan key:generate --force

echo "Waiting for postgres at ${DB_HOST}:${DB_PORT}..."
until php -r 'exit(@pg_connect(sprintf("host=%s port=%s dbname=%s user=%s password=%s connect_timeout=2", getenv("DB_HOST"), getenv("DB_PORT"), getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD"))) ? 0 : 1);'; do
    sleep 1
done

php artisan config:clear
php artisan migrate --force

# Every seeder upserts by a natural key, so re-running on each start is safe.
php artisan db:seed --force

exec "$@"
