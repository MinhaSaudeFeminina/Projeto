<?php

namespace App\Services\Audit;

use App\Models\EditorialAuditEvent;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditRecorder
{
    public function __construct(private readonly AuditSanitizer $sanitizer)
    {
    }

    public function recordEditorialEvent(
        ?User $actor,
        string $action,
        ?EducationalContent $content = null,
        ?string $previousStatus = null,
        ?string $newStatus = null,
        ?string $comment = null,
        array $metadata = [],
        ?User $targetAdminUser = null,
    ): EditorialAuditEvent {
        return EditorialAuditEvent::create([
            'actor_id' => $actor?->id,
            'content_id' => $content?->id,
            'target_admin_user_id' => $targetAdminUser?->id,
            'action' => $action,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'comment' => $comment,
            'metadata' => $this->sanitizer->sanitize($metadata),
            'occurred_at' => now(),
        ]);
    }

    public function record(?User $actor, string $targetType, ?int $targetId, string $action, array $metadata = [], ?string $previousState = null, ?string $newState = null): EditorialAuditEvent
    {
        $content = null;

        if (is_a($targetType, EducationalContent::class, true) && $targetId !== null) {
            $content = EducationalContent::query()->find($targetId);
        }

        return $this->recordEditorialEvent(
            actor: $actor,
            action: $action,
            content: $content instanceof Model ? $content : null,
            previousStatus: $previousState,
            newStatus: $newState,
            metadata: $metadata,
        );
    }
}
