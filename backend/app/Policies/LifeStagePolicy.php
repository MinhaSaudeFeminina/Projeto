<?php

namespace App\Policies;

use App\Models\AdminRole;
use App\Models\LifeStage;
use App\Models\User;

class LifeStagePolicy
{
    /** Autores precisam ler a taxonomia para marcar conteúdos. */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyAdminRole([AdminRole::AUTHOR, AdminRole::REVIEWER, AdminRole::ADMIN]);
    }

    public function view(User $user, LifeStage $lifeStage): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasAdminRole(AdminRole::ADMIN);
    }

    /** Uma trilha arquivada é histórico: reabri-la exige despublicar antes. */
    public function update(User $user, LifeStage $lifeStage): bool
    {
        return $user->hasAdminRole(AdminRole::ADMIN) && $lifeStage->status !== LifeStage::ARCHIVED;
    }

    /**
     * Vincular e reordenar conteúdos é edição da trilha, não do conteúdo, então
     * segue a mesma regra do update.
     */
    public function syncContents(User $user, LifeStage $lifeStage): bool
    {
        return $this->update($user, $lifeStage);
    }

    /**
     * A publicação é o portão que leva a trilha ao app, e cabe ao admin ou ao
     * professor/revisor — nunca a quem só escreve.
     */
    public function publish(User $user, LifeStage $lifeStage): bool
    {
        return $lifeStage->status !== LifeStage::PUBLISHED
            && $user->hasAnyAdminRole([AdminRole::REVIEWER, AdminRole::ADMIN]);
    }

    public function archive(User $user, LifeStage $lifeStage): bool
    {
        return $lifeStage->status === LifeStage::PUBLISHED
            && $user->hasAnyAdminRole([AdminRole::REVIEWER, AdminRole::ADMIN]);
    }

    public function delete(User $user, LifeStage $lifeStage): bool
    {
        return $user->hasAdminRole(AdminRole::ADMIN) && $lifeStage->status === LifeStage::DRAFT;
    }
}
