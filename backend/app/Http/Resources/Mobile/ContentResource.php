<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'body' => $this->when($request->route('slug') !== null, $this->body),
            'category' => [
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ],
            'published_at' => $this->published_at?->toISOString(),
        ];
    }
}
