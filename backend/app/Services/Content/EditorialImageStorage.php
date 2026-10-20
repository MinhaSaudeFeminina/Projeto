<?php

namespace App\Services\Content;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EditorialImageStorage
{
    private const DIRECTORY = 'editorial-images';

    public function store(UploadedFile $image): string
    {
        $extension = $image->extension() ?: 'png';
        $path = $image->storeAs(self::DIRECTORY, Str::uuid()->toString().'.'.$extension, 'public');

        return url(Storage::disk('public')->url($path));
    }

    public function isManagedUrl(string $url): bool
    {
        $candidate = parse_url($url);
        $base = parse_url($this->baseUrl());

        if (! is_array($candidate) || ! is_array($base)) {
            return false;
        }

        return ($candidate['scheme'] ?? null) === ($base['scheme'] ?? null)
            && ($candidate['host'] ?? null) === ($base['host'] ?? null)
            && ($candidate['port'] ?? null) === ($base['port'] ?? null)
            && Str::startsWith($candidate['path'] ?? '', ($base['path'] ?? '').'/');
    }

    private function baseUrl(): string
    {
        $application = app();
        $appUrl = $application->bound('config') ? config('app.url') : 'http://localhost';

        return rtrim((string) $appUrl, '/').'/storage/'.self::DIRECTORY;
    }
}
