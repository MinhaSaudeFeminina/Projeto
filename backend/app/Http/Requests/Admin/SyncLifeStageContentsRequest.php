<?php

namespace App\Http\Requests\Admin;

use App\Models\LifeStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncLifeStageContentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lifeStage = $this->route('lifeStage');

        return $lifeStage instanceof LifeStage
            && ($this->user()?->can('syncContents', $lifeStage) ?? false);
    }

    /**
     * A ordem do array é a ordem da trilha: a posição de cada item vira o
     * `sort_order` do vínculo.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'content_ids' => ['present', 'array', 'max:100'],
            'content_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('educational_contents', 'id')->whereNot('status', 'archived'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content_ids.*.exists' => 'Só é possível vincular conteúdos que existam e não estejam arquivados.',
        ];
    }
}
