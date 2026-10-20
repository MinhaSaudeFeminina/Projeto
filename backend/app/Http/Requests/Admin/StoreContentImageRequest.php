<?php

namespace App\Http\Requests\Admin;

use App\Models\EducationalContent;
use Illuminate\Foundation\Http\FormRequest;

class StoreContentImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $content = $this->route('content');

        return $content instanceof EducationalContent
            && ($this->user()?->can('update', $content) ?? false);
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
