import { requestJson } from './client';
import type { ApiResult } from './types';

export type ProfileResponse = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  profile: {
    birth_date: string | null;
    calculated_age: number | null;
    age_range: number | null;
    life_stage_id: number | null;
  };
};

export type ProfileUpdate = {
  name?: string;
  birth_date?: string;
  life_stage_id?: number | null;
};

export function getCurrentProfile(): Promise<ApiResult<ProfileResponse>> {
  return requestJson<ProfileResponse>('/me');
}

export function updateCurrentProfile(
  updates: ProfileUpdate,
): Promise<ApiResult<ProfileResponse>> {
  return requestJson<ProfileResponse>('/me', {
    body: updates,
    method: 'PATCH',
  });
}
