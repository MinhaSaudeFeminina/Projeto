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
      'Em situações de urgência, violência ou sofrimento emocional, procure apoio imediatamente pelos canais disponíveis.',
    title: 'Você não está sozinha',
  };
}
