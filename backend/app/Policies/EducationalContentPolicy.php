<?php

namespace App\Policies;

use App\Models\AdminRole;
use App\Models\EducationalContent;
use App\Models\User;

class EducationalContentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyAdminRole([AdminRole::AUTHOR, AdminRole::REVIEWER, AdminRole::ADMIN]);
    }

    public function view(User $user, EducationalContent $content): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyAdminRole([AdminRole::AUTHOR, AdminRole::ADMIN]);
    }

    public function update(User $user, EducationalContent $content): bool
    {
        if ($user->hasAdminRole(AdminRole::ADMIN)) {
            return $content->status !== EducationalContent::ARCHIVED;
        }

        return $user->hasAdminRole(AdminRole::AUTHOR)
            && $content->author_id === $user->id
            && $content->status === EducationalContent::DRAFT;
    }

    public function submit(User $user, EducationalContent $content): bool
    {
        return $content->status === EducationalContent::DRAFT && $this->update($user, $content);
    }

    public function review(User $user, EducationalContent $content): bool
    {
        return $content->status === EducationalContent::IN_REVIEW
            && $user->hasAnyAdminRole([AdminRole::REVIEWER, AdminRole::ADMIN]);
    }

    public function publish(User $user, EducationalContent $content): bool
    {
        return $content->status === EducationalContent::APPROVED
            && $user->hasAdminRole(AdminRole::ADMIN);
    }

    public function archive(User $user, EducationalContent $content): bool
    {
        return $content->status === EducationalContent::PUBLISHED
            && $user->hasAdminRole(AdminRole::ADMIN);
    }

    public function viewAudit(User $user, EducationalContent $content): bool
    {
        return $user->hasAnyAdminRole([AdminRole::REVIEWER, AdminRole::ADMIN])
            || ($user->hasAdminRole(AdminRole::AUTHOR) && $content->author_id === $user->id);
    }
}
