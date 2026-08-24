<?php

namespace App\Services\Content;

use App\Models\EducationalContent;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EditorialWorkflowService
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly ContentRevisionRecorder $revisions,
    ) {}

    public function submit(EducationalContent $content, User $actor): EducationalContent
    {
        return $this->transition(
            content: $content,
            actor: $actor,
            expectedState: EducationalContent::DRAFT,
            newState: EducationalContent::IN_REVIEW,
            action: 'submitted_for_review',
            attributes: [
                'submitted_by' => $actor->id,
                'submitted_at' => now(),
                'reviewed_by' => null,
                'reviewed_at' => null,
                'approved_by' => null,
                'approved_at' => null,
            ],
        );
    }

    public function approve(EducationalContent $content, User $actor, ?string $comment = null): EducationalContent
    {
        return $this->transition(
            content: $content,
            actor: $actor,
            expectedState: EducationalContent::IN_REVIEW,
            newState: EducationalContent::APPROVED,
            action: 'approved',
            attributes: [
                'reviewed_by' => $actor->id,
                'reviewed_at' => now(),
                'approved_by' => $actor->id,
                'approved_at' => now(),
            ],
            comment: $comment,
        );
    }

    public function requestAdjustments(EducationalContent $content, User $actor, string $comment): EducationalContent
    {
        return $this->transition(
            content: $content,
            actor: $actor,
            expectedState: EducationalContent::IN_REVIEW,
            newState: EducationalContent::DRAFT,
            action: 'adjustments_requested',
            attributes: [
                'reviewed_by' => $actor->id,
                'reviewed_at' => now(),
            ],
            comment: $comment,
        );
    }

    public function publish(EducationalContent $content, User $actor): EducationalContent
    {
        return $this->transition(
            content: $content,
            actor: $actor,
            expectedState: EducationalContent::APPROVED,
            newState: EducationalContent::PUBLISHED,
            action: 'published',
            attributes: ['published_by' => $actor->id, 'published_at' => now()],
            requiresApprovalMetadata: true,
        );
    }

    public function archive(EducationalContent $content, User $actor): EducationalContent
    {
        return $this->transition(
            content: $content,
            actor: $actor,
            expectedState: EducationalContent::PUBLISHED,
            newState: EducationalContent::ARCHIVED,
            action: 'archived',
            attributes: ['archived_by' => $actor->id, 'archived_at' => now()],
        );
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function transition(
        EducationalContent $content,
        User $actor,
        string $expectedState,
        string $newState,
        string $action,
        array $attributes = [],
        ?string $comment = null,
        bool $requiresApprovalMetadata = false,
    ): EducationalContent {
        return DB::transaction(function () use ($content, $actor, $expectedState, $newState, $action, $attributes, $comment, $requiresApprovalMetadata): EducationalContent {
            $lockedContent = EducationalContent::query()->lockForUpdate()->findOrFail($content->id);
            $this->ensureState($lockedContent, $expectedState);

            if ($requiresApprovalMetadata) {
                $this->ensureApprovalRecorded($lockedContent);
            }

            $previousState = $lockedContent->status;
            $lockedContent->forceFill([
                ...$attributes,
                'status' => $newState,
            ])->save();

            $this->revisions->record($lockedContent, $actor, $action);
            $this->audit->recordEditorialEvent(
                actor: $actor,
                action: $action,
                content: $lockedContent,
                previousStatus: $previousState,
                newStatus: $newState,
                comment: $comment,
                metadata: $comment === null ? [] : ['has_comment' => true],
            );

            return $lockedContent->refresh()->load(['category', 'lifeStages', 'ageRanges', 'author:id,name']);
        });
    }

    private function ensureState(EducationalContent $content, string $expected): void
    {
        if ($content->status !== $expected) {
            throw ValidationException::withMessages([
                'status' => ["Estado editorial inválido. Esperado: {$expected}."],
            ]);
        }
    }

    private function ensureApprovalRecorded(EducationalContent $content): void
    {
        if ($content->approved_by === null || $content->approved_at === null) {
            throw ValidationException::withMessages([
                'approval' => ['A publicação exige uma aprovação editorial registrada.'],
            ]);
        }
    }
}
