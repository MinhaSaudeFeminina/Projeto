import { emergencyContacts, type EmergencyContact } from '../data/mockData';

import { ok, type ApiResult } from './types';

export function listEmergencyContacts(): ApiResult<EmergencyContact[]> {
  return ok(emergencyContacts as EmergencyContact[]);
}
