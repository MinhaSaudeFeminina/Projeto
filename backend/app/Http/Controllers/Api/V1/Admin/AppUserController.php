<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAppUserRequest;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use App\Services\Profile\AgeRangeCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->hasPermission('admin_users.manage'), 403);

        $users = User::query()
            ->where('user_type', 'mobile_user')
            ->with(['profile.lifeStage'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => $this->payload($user))
            ->values();

        return response()->json($users, 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function update(
        UpdateAppUserRequest $request,
        User $appUser,
        AuditRecorder $audit,
        AgeRangeCalculator $calculator,
    ): JsonResponse {
        abort_unless($appUser->isMobileUser(), 404);

        $data = $request->validated();
        $wasActive = $appUser->is_active;

        DB::transaction(function () use ($appUser, $audit, $calculator, $data, $request, $wasActive): void {
            $appUser->fill([
                'name' => $data['name'],
                'email' => $data['email'],
                'is_active' => $data['is_active'],
            ])->save();

            $profileData = [
                'life_stage_id' => $data['life_stage_id'] ?? null,
                'privacy_settings' => ['push_discreet' => $data['notifications_active']],
            ];

            if (! empty($data['birth_date'])) {
                $profileData['birth_date'] = $data['birth_date'];
                $profileData['calculated_age'] = $calculator->ageFromBirthDate($data['birth_date']);
                $profileData['age_range_id'] = $calculator->rangeForBirthDate($data['birth_date'])?->id;
            }

            if ($appUser->profile || ! empty($profileData['birth_date'])) {
                $appUser->profile()->updateOrCreate(['user_id' => $appUser->id], $profileData);
            }

            if ($wasActive && ! $appUser->is_active) {
                $appUser->tokens()->delete();
            }

            $audit->recordEditorialEvent(
                actor: $request->user(),
                action: $wasActive && ! $appUser->is_active ? 'app_user_deactivated' : 'app_user_updated',
                metadata: [
                    'target_user_id' => $appUser->id,
                    'email' => $appUser->email,
                    'is_active' => $appUser->is_active,
                    'notifications_active' => $data['notifications_active'],
                ],
            );
        });

        return response()->json($this->payload($appUser->refresh()->load(['profile.lifeStage'])), 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(User $user): array
    {
        $profile = $user->profile;
        $privacySettings = $profile?->privacy_settings ?? [];

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'age' => $profile?->calculated_age,
            'birth_date' => $profile?->birth_date?->toDateString(),
            'life_stage_id' => $profile?->life_stage_id,
            'life_stage' => $profile?->lifeStage?->name,
            'is_active' => $user->is_active,
            'notifications_active' => (bool) ($privacySettings['push_discreet'] ?? true),
            'last_access_at' => $user->last_login_at ?? null,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}
