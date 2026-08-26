<?php

namespace App\Policies;

use App\Models\AdminRole;
use App\Models\Symptom;
use App\Models\User;

class SymptomPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyAdminRole([
            AdminRole::AUTHOR,
            AdminRole::REVIEWER,
            AdminRole::ADMIN,
        ]);
    }

    public function view(User $user, Symptom $symptom): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('symptoms.manage');
    }

    public function update(User $user, Symptom $symptom): bool
    {
        return $user->hasPermission('symptoms.manage');
    }

    public function delete(User $user, Symptom $symptom): bool
    {
        return $user->hasPermission('symptoms.manage');
    }
}
