<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminRole;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class RolePermissionController extends Controller
{
    public function roles(): JsonResponse
    {
        $this->authorize('viewRoles', User::class);

        return response()->json(
            AdminRole::query()->orderBy('id')->get(['id', 'key', 'name', 'description']),
            200,
            [],
            JSON_UNESCAPED_UNICODE,
        );
    }

    public function permissions(): JsonResponse
    {
        $this->authorize('viewRoles', User::class);

        return response()->json(
            Permission::query()->orderBy('key')->get(['id', 'key', 'name', 'description']),
            200,
            [],
            JSON_UNESCAPED_UNICODE,
        );
    }
}
