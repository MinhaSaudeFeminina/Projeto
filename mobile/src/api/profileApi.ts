import { mockUser, type UserProfile } from '../data/mockData';

import { fail, ok, type ApiResult } from './types';

let currentProfile: UserProfile = {
  ...mockUser,
};

export type ProfilePreferenceUpdates = Partial<
  Pick<UserProfile, 'notificationsEnabled' | 'dataSharingEnabled'>
>;

export function getCurrentProfile(): ApiResult<UserProfile> {
  return ok(currentProfile);
}

export function updateProfilePreferences(
  updates: ProfilePreferenceUpdates,
): ApiResult<UserProfile> {
  if (
    (updates.notificationsEnabled !== undefined &&
      typeof updates.notificationsEnabled !== 'boolean') ||
    (updates.dataSharingEnabled !== undefined &&
      typeof updates.dataSharingEnabled !== 'boolean')
  ) {
    return fail(
      'INVALID_PROFILE_PREFERENCES',
      'Preferencias do perfil invalidas.',
    );
  }

  currentProfile = {
    ...currentProfile,
    ...updates,
  };

  return ok(currentProfile);
}

export function resetProfilePreferences(): ApiResult<UserProfile> {
  currentProfile = {
    ...mockUser,
  };

  return ok(currentProfile);
}
