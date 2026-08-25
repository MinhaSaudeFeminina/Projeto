import {
  getCurrentProfile,
  updateProfilePreferences,
  type ProfilePreferenceUpdates,
} from '../api/profileApi';
import type { ApiResult } from '../api/types';
import type { UserProfile } from '../data/mockData';

export type ProfileStats = {
  cyclesRecorded: number;
  regularity: string;
  cycleAverageDays: number;
  periodAverageDays: number;
};

export function getProfile(): ApiResult<UserProfile> {
  return getCurrentProfile();
}

export function getProfileStats(): ApiResult<ProfileStats> {
  const result = getCurrentProfile();

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: {
      cyclesRecorded: result.data.cyclesRecorded,
      regularity: result.data.regularity,
      cycleAverageDays: result.data.cycleAverageDays,
      periodAverageDays: result.data.periodAverageDays,
    },
  };
}

export function updatePreferences(
  updates: ProfilePreferenceUpdates,
): ApiResult<UserProfile> {
  return updateProfilePreferences(updates);
}

export function toggleNotifications(): ApiResult<UserProfile> {
  const profile = getCurrentProfile();

  if (!profile.ok) {
    return profile;
  }

  return updateProfilePreferences({
    notificationsEnabled: !profile.data.notificationsEnabled,
  });
}

export function toggleDataSharing(): ApiResult<UserProfile> {
  const profile = getCurrentProfile();

  if (!profile.ok) {
    return profile;
  }

  return updateProfilePreferences({
    dataSharingEnabled: !profile.data.dataSharingEnabled,
  });
}
