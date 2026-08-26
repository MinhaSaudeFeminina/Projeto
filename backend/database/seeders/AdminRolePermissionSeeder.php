<?php

namespace Database\Seeders;

use App\Models\AdminRole;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class AdminRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = collect([
            'content.create' => 'Criar conteúdo',
            'content.update_own_draft' => 'Editar rascunho próprio',
            'content.submit_review' => 'Enviar para revisão',
            'content.review' => 'Revisar conteúdo',
            'content.approve' => 'Aprovar conteúdo',
            'content.publish' => 'Publicar conteúdo',
            'content.archive' => 'Arquivar conteúdo',
            'admin_users.manage' => 'Gerenciar usuários administrativos',
            'roles.manage' => 'Gerenciar perfis e permissões',
            'taxonomy.manage' => 'Gerenciar taxonomias',
            'audit.view' => 'Ver auditoria',
            'notifications.view' => 'Ver notificações',
            'anonymous_questions.manage' => 'Gerenciar perguntas anônimas',
        ])->map(fn (string $name, string $key) => Permission::updateOrCreate(
            ['key' => $key],
            ['name' => $name, 'description' => $name],
        ));

        $roles = [
            AdminRole::AUTHOR => [
                'name' => 'Acadêmica/autora',
                'description' => 'Cria e edita rascunhos próprios.',
                'permissions' => ['content.create', 'content.update_own_draft', 'content.submit_review', 'notifications.view'],
            ],
            AdminRole::REVIEWER => [
                'name' => 'Revisor/professor',
                'description' => 'Revisa, aprova ou solicita ajustes.',
                'permissions' => ['content.review', 'content.approve', 'audit.view', 'notifications.view', 'anonymous_questions.manage'],
            ],
            AdminRole::ADMIN => [
                'name' => 'Admin',
                'description' => 'Gerencia conteúdos, usuários e permissões.',
                'permissions' => $permissions->keys()->all(),
            ],
        ];

        foreach ($roles as $key => $data) {
            $role = AdminRole::updateOrCreate(
                ['key' => $key],
                ['name' => $data['name'], 'description' => $data['description'], 'permissions' => $data['permissions']],
            );

            $role->permissions()->sync(
                $permissions->only($data['permissions'])->pluck('id')->all(),
            );
        }
    }
}
