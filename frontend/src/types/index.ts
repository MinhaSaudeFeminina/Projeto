export type ContentStatus = 'rascunho' | 'em_revisao' | 'publicado' | 'arquivado';
export type QuestionStatus = 'nova' | 'em_analise' | 'respondida' | 'arquivada';
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type UserRole = 'admin' | 'editor' | 'profissional' | 'visualizador';
export type NotificationStatus = 'rascunho' | 'agendada' | 'enviada' | 'cancelada';
export type ReminderType = 'exame_preventivo' | 'mamografia' | 'vacina_hpv' | 'consulta' | 'medicamento' | 'menstruacao' | 'autoexame' | 'campanha';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  avatar?: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  summary: string;
  body: string;
  normalText: string;
  ubsText: string;
  homeCareText: string;
  disclaimer: string;
  lifeStageId: string;
  tags: string[];
  coverImage?: string;
  status: ContentStatus;
  authorId: string;
  reviewerId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifeStage {
  id: string;
  name: string;
  description: string;
  banner?: string;
  contentIds: string[];
  reminderSuggestions: string[];
  warningSignals: string[];
  ubsOrientation: string;
  order: number;
  status: ContentStatus;
}

export interface Symptom {
  id: string;
  name: string;
  type: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  category: string;
  showInApp: boolean;
  askIntensity: boolean;
  askNotes: boolean;
  generateUbsAlert: boolean;
  orientationText: string;
  severityAlertText: string;
  order: number;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: ReminderType;
  audience: string;
  lifeStage: string;
  periodicity: string;
  startDate: string;
  endDate?: string;
  shortMessage: string;
  expandedMessage: string;
  isActive: boolean;
  priority: Priority;
  channel: string;
}

export interface AnonymousQuestion {
  id: string;
  question: string;
  category: string;
  createdAt: string;
  status: QuestionStatus;
  priority: Priority;
  answer?: string;
  internalNotes?: string;
  assignedTo?: string;
  riskTag?: string;
  isSensitive: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  age: number;
  lifeStage: string;
  city?: string;
  status: string;
  notificationsActive: boolean;
  lastAccess: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  audience: string;
  segment: string;
  category: string;
  scheduleDate?: string;
  status: NotificationStatus;
  ctaLabel?: string;
  ctaLink?: string;
  image?: string;
  createdAt: string;
  deliveryRate?: number;
  openRate?: number;
}

export interface SupportContact {
  id: string;
  name: string;
  description: string;
  phone?: string;
  type: string;
  link?: string;
  ctaLabel: string;
  isHighlighted: boolean;
  isActive: boolean;
}
