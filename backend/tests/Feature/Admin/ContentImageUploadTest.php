<?php

use App\Models\AdminRole;
use App\Models\ContentCategory;
use App\Models\EducationalContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

function draftContentForImageUpload(int $authorId): EducationalContent
{
    $category = ContentCategory::create(['name' => 'Prevenção', 'slug' => 'prevencao']);

    return EducationalContent::create([
        'title' => 'Cuidados educativos',
        'slug' => 'cuidados-educativos',
        'summary' => 'Resumo educativo.',
        'body' => '<p>Conteúdo educativo.</p>',
        'category_id' => $category->id,
        'status' => EducationalContent::DRAFT,
        'author_id' => $authorId,
    ]);
}

it('stores an image pasted into an owned draft and returns an absolute URL', function (): void {
    Storage::fake('public');
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $content = draftContentForImageUpload($author->id);

    $response = $this->actingAs($author, 'sanctum')
        ->post("/api/v1/admin/contents/{$content->id}/images", [
            'image' => UploadedFile::fake()->image('sinais.png', 640, 480),
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.url', fn (string $url): bool => str_starts_with($url, 'http://'));

    $path = str_replace('/storage/', '', parse_url($response->json('data.url'), PHP_URL_PATH));
    expect($path)->toStartWith('editorial-images/')
        ->and(Storage::disk('public')->exists($path))->toBeTrue();
});

it('blocks an author from uploading an image to another author draft', function (): void {
    Storage::fake('public');
    $owner = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $otherAuthor = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $content = draftContentForImageUpload($owner->id);

    $this->actingAs($otherAuthor, 'sanctum')
        ->post("/api/v1/admin/contents/{$content->id}/images", [
            'image' => UploadedFile::fake()->image('sinais.png'),
        ])
        ->assertForbidden();

    Storage::disk('public')->assertDirectoryEmpty('editorial-images');
});

it('rejects a pasted image above the five megabyte limit', function (): void {
    Storage::fake('public');
    $author = adminUserWithCanonicalRole(AdminRole::AUTHOR);
    $content = draftContentForImageUpload($author->id);

    $this->actingAs($author, 'sanctum')
        ->post("/api/v1/admin/contents/{$content->id}/images", [
            'image' => UploadedFile::fake()->image('grande.png')->size(5121),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image');

    Storage::disk('public')->assertDirectoryEmpty('editorial-images');
});
