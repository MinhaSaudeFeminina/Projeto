<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginAdminRequest;
use App\Models\AdminRole;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginAdminRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()
            ->where('email', $validated['email'])
            ->where('user_type', 'admin_user')
            ->where('is_active', true)
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais administrativas são inválidas.'],
            ]);
        }

        $roles = $user->adminRoles()->pluck('key')->filter()->values();
        $abilities = $roles->contains(AdminRole::ADMIN) ? ['*'] : $roles->all();

        return response()->json([
            'token' => $user->createToken('admin-web', $abilities)->plainTextToken,
            'user' => $this->adminUserPayload($user),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->adminUserPayload($request->user()),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        } else {
            $request->user()?->tokens()->delete();
        }

        return response()->json(status: 204);
    }

    /**
     * @return array{id: int, name: string, email: string, roles: mixed}
     */
    private function adminUserPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->adminRoles()->pluck('key')->filter()->values(),
        ];
    }
}
