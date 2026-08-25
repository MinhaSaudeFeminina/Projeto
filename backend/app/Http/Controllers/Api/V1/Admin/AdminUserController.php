<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Models\AdminRole;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->where('user_type', 'admin_user')
            ->with('adminRoles')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => $this->payload($user))
            ->values();

        return response()->json($users, 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function store(StoreAdminUserRequest $request, AuditRecorder $audit): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data, $request, $audit): User {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'user_type' => 'admin_user',
                'is_active' => $data['is_active'],
            ]);

            $this->syncRole($user, $data['role'], $request->user());

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'admin_user_created',
                metadata: [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $data['role'],
                    'is_active' => $user->is_active,
                ],
                targetAdminUser: $user,
            );

            return $user;
        });

        return response()->json($this->payload($user->load('adminRoles')), 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function update(UpdateAdminUserRequest $request, User $adminUser, AuditRecorder $audit): JsonResponse
    {
        $data = $request->validated();
        $previousRole = $adminUser->adminRoles()->value('key');
        $wasActive = $adminUser->is_active;

        DB::transaction(function () use ($data, $request, $adminUser, $audit, $previousRole, $wasActive): void {
            $adminUser->fill([
                'name' => $data['name'],
                'email' => $data['email'],
                'is_active' => $data['is_active'],
            ]);

            if (! empty($data['password'])) {
                $adminUser->password = Hash::make($data['password']);
            }

            $adminUser->save();
            $this->syncRole($adminUser, $data['role'], $request->user());

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: 'admin_user_updated',
                metadata: [
                    'name' => $adminUser->name,
                    'email' => $adminUser->email,
                    'is_active' => $adminUser->is_active,
                ],
                targetAdminUser: $adminUser,
            );

            if ($previousRole !== $data['role']) {
                $audit->recordEditorialEvent(
                    actor: $request->user(),
                    action: 'role_changed',
                    metadata: [
                        'previous_role' => $previousRole,
                        'new_role' => $data['role'],
                    ],
                    targetAdminUser: $adminUser,
                );
            }

            if ($wasActive && ! $adminUser->is_active) {
                $adminUser->tokens()->delete();
                $audit->recordEditorialEvent(
                    actor: $request->user(),
                    action: 'admin_user_deactivated',
                    metadata: ['email' => $adminUser->email],
                    targetAdminUser: $adminUser,
                );
            }
        });

        return response()->json($this->payload($adminUser->refresh()->load('adminRoles')), 200, [], JSON_UNESCAPED_UNICODE);
    }

    private function syncRole(User $user, string $roleKey, ?User $actor): void
    {
        $role = AdminRole::where('key', $roleKey)->firstOrFail();
        $user->adminRoles()->sync([$role->id => ['assigned_by' => $actor?->id]]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->adminRoles->first()?->key,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at ?? null,
        ];
    }
}
