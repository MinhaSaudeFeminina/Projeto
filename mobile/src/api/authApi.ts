import { requestJson } from './client';
import type { ApiResult } from './types';

export type MobileAccessState =
  | 'full'
  | 'restricted'
  | 'email_verification_required';

export type MobileUser = {
  id: number;
  name: string;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  access_state: MobileAccessState;
  user: MobileUser;
};

export function loginMobileUser(
  credentials: LoginCredentials,
): Promise<ApiResult<LoginResponse>> {
  return requestJson<LoginResponse>('/auth/login', {
    body: credentials,
    method: 'POST',
  });
}
