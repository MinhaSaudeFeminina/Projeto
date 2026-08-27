import {
  getCurrentProfile,
  updateCurrentProfile,
  type ProfileResponse,
  type ProfileUpdate,
} from '../api/profileApi';
import type { ApiResult } from '../api/types';

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  birthDate: string | null;
  age: number | null;
  lifeStageId: number | null;
};

export async function getProfile(): Promise<ApiResult<UserProfile>> {
  const result = await getCurrentProfile();

  return result.ok ? { ok: true, data: toUserProfile(result.data) } : result;
}

export async function updateProfile(
  updates: ProfileUpdate,
): Promise<ApiResult<UserProfile>> {
  const result = await updateCurrentProfile(updates);

  return result.ok ? { ok: true, data: toUserProfile(result.data) } : result;
}

function toUserProfile(response: ProfileResponse): UserProfile {
  return {
    age: response.profile.calculated_age,
    birthDate: response.profile.birth_date,
    email: response.user.email,
    id: response.user.id,
    lifeStageId: response.profile.life_stage_id,
    name: response.user.name,
  };
}
