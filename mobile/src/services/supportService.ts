import { emergencyContacts, type EmergencyContact } from '../data/staticContent';

export type SupportInfo = {
  title: string;
  description: string;
  contacts: EmergencyContact[];
};

export function getSupportInfo(): SupportInfo {
  return {
    contacts: emergencyContacts,
    description:
      'Em situacoes de urgencia, violencia ou sofrimento emocional, procure apoio imediatamente pelos canais disponiveis.',
    title: 'Voce nao esta sozinha',
  };
}
