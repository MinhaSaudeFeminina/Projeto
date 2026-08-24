<?php

namespace App\Services\Notifications;

use App\Models\AdminRole;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AdminNotificationRecipientResolver
{
    /**
     * @return Collection<int, User>
     */
    public function resolve(string $event, EducationalContent $content, User $actor): Collection
    {
        $recipients = match ($event) {
            'submitted_for_review' => $this->usersWithRole(AdminRole::REVIEWER),
            'approved' => $this->usersWithRole(AdminRole::ADMIN),
            'adjustments_requested', 'published', 'archived' => $this->contentAuthor($content),
            default => new Collection,
        };

        return $recipients
            ->reject(fn (User $user): bool => $user->id === $actor->id)
            ->unique('id')
            ->values();
    }

    /**
     * @return Collection<int, User>
     */
    private function usersWithRole(string $role): Collection
    {
        return User::query()
            ->where('user_type', 'admin_user')
            ->where('is_active', true)
            ->whereHas('adminRoles', fn ($query) => $query->where('key', $role))
            ->orderBy('id')
            ->get();
    }

    /**
     * @return Collection<int, User>
     */
    private function contentAuthor(EducationalContent $content): Collection
    {
        return User::query()
            ->whereKey($content->author_id)
            ->where('user_type', 'admin_user')
            ->where('is_active', true)
            ->get();
    }
}
