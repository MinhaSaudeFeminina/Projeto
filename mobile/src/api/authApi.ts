import { requestJson } from './client';
import type { ApiResult } from './types';

export type MobileAccessState = 'full' | 'restricted';

export type MobileUser = {
  id: number;
  name: string;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  /** ISO `YYYY-MM-DD`; the backend derives age range and life stage from it. */
  birth_date: string;
  life_stage_id?: number | null;
  accepted_terms: boolean;
};

export type AuthResponse = {
  token: string;
  access_state: MobileAccessState;
  user: MobileUser;
};

export function loginMobileUser(
  credentials: LoginCredentials,
): Promise<ApiResult<AuthResponse>> {
  return requestJson<AuthResponse>('/auth/login', {
    body: credentials,
    method: 'POST',
  });
}

export function registerMobileUser(
  payload: RegisterPayload,
): Promise<ApiResult<AuthResponse>> {
  return requestJson<AuthResponse>('/auth/register', {
    body: payload,
    method: 'POST',
  });
}
