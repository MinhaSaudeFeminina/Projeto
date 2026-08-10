<?php

namespace App\Policies;

use App\Models\User;

class AdminUserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('admin_users.manage');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('admin_users.manage');
    }

    public function update(User $user, User $target): bool
    {
        return $user->hasPermission('admin_users.manage') && $target->isAdminUser();
    }

    public function viewRoles(User $user): bool
    {
        return $user->hasPermission('admin_users.manage') || $user->hasPermission('roles.manage');
    }
}
