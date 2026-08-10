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
    ) {
    }

    public function submit(EducationalContent $content, User $actor): EducationalContent
    {
        $this->ensureState($content, EducationalContent::DRAFT);

        $content->forceFill([
            'submitted_by' => $actor->id,
            'submitted_at' => now(),
        ]);

        return $this->transition($content, $actor, EducationalContent::IN_REVIEW, 'submitted_for_review');
    }

    public function approve(EducationalContent $content, User $actor, ?string $comment = null): EducationalContent
    {
        $this->ensureState($content, EducationalContent::IN_REVIEW);

        $content->forceFill([
            'reviewed_by' => $actor->id,
            'reviewed_at' => now(),
            'approved_by' => $actor->id,
            'approved_at' => now(),
        ]);

        return $this->transition($content, $actor, EducationalContent::APPROVED, 'approved', ['comment' => $comment], $comment);
    }

    public function requestAdjustments(EducationalContent $content, User $actor, string $comment, string $outcome = 'adjustments_requested'): EducationalContent
    {
        $this->ensureState($content, EducationalContent::IN_REVIEW);

        $content->forceFill([
            'reviewed_by' => $actor->id,
            'reviewed_at' => now(),
        ]);

        return $this->transition($content, $actor, EducationalContent::DRAFT, $outcome, ['comment' => $comment], $comment);
    }

    public function publish(EducationalContent $content, User $actor): EducationalContent
    {
        $this->ensureState($content, EducationalContent::APPROVED);
        $content->forceFill(['published_by' => $actor->id, 'published_at' => now()]);

        return $this->transition($content, $actor, EducationalContent::PUBLISHED, 'published');
    }

    public function archive(EducationalContent $content, User $actor): EducationalContent
    {
        $this->ensureState($content, EducationalContent::PUBLISHED);
        $content->forceFill(['archived_by' => $actor->id, 'archived_at' => now()]);

        return $this->transition($content, $actor, EducationalContent::ARCHIVED, 'archived');
    }

    private function transition(EducationalContent $content, User $actor, string $newState, string $action, array $metadata = [], ?string $comment = null): EducationalContent
    {
        return DB::transaction(function () use ($content, $actor, $newState, $action, $metadata, $comment): EducationalContent {
            $previous = $content->status;
            $content->status = $newState;
            $content->save();

            $this->revisions->record($content, $actor, $action);
            $this->audit->recordEditorialEvent($actor, $action, $content, $previous, $newState, $comment, $metadata);

            return $content->refresh();
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
}
