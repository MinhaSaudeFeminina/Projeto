<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SymptomResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'short_description' => $this->short_description,
            'full_description' => $this->description,
            'icon' => $this->icon,
            'category' => $this->category,
            'show_in_app' => $this->show_in_app,
            'ask_intensity' => $this->ask_intensity,
            'ask_notes' => $this->ask_notes,
            'generate_ubs_alert' => $this->is_alert_candidate,
            'orientation_text' => $this->orientation_text,
            'severity_alert_text' => $this->severity_alert_text,
            'sort_order' => $this->sort_order,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
