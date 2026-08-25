import { listEmergencyContacts } from '../api/supportApi';
import type { ApiResult } from '../api/types';
import type { EmergencyContact } from '../data/mockData';

export type SupportInfo = {
  title: string;
  description: string;
  contacts: EmergencyContact[];
};

export function getEmergencyContacts(): ApiResult<EmergencyContact[]> {
  return listEmergencyContacts();
}

export function getSupportInfo(): ApiResult<SupportInfo> {
  const result = listEmergencyContacts();

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: {
      title: 'Voce nao esta sozinha',
      description:
        'Em situacoes de urgencia, violencia ou sofrimento emocional, procure apoio imediatamente pelos canais disponiveis.',
      contacts: result.data,
    },
  };
}
