/**
 * Fixed editorial content that does not belong to any user and has no backend
 * behind it: public emergency numbers, the quick-action menu, life-stage
 * tracks and the canned answers of the anonymous question screen.
 */

export type EmergencyContact = {
  name: string;
  number: string;
  description: string;
};

export type QuickAction = {
  id: string;
  label: string;
  icon: string;
};

export type LifeStageTrack = {
  id: string;
  label: string;
  icon: string;
  age: string;
  description: string;
};

export type AnonymousMessage = {
  id: string;
  text: string;
  isUser: boolean;
};

export const emergencyContacts: EmergencyContact[] = [
  { name: 'Central de Atendimento à Mulher', number: '180', description: '24h, gratuito e sigiloso' },
  { name: 'SAMU', number: '192', description: 'Urgências e emergências' },
  { name: 'Polícia Militar', number: '190', description: 'Emergências' },
  { name: 'CVV - Apoio Emocional', number: '188', description: '24h, gratuito e sigiloso' },
  { name: 'Disque Saúde', number: '136', description: 'Informações sobre saúde' },
];

export const healthTips: string[] = [
  'Beba pelo menos 2 litros de água por dia para manter seu corpo hidratado e saudável.',
  'O autoexame das mamas deve ser feito mensalmente. Conheça seu corpo!',
  'Exercícios físicos regulares ajudam a aliviar cólicas e melhorar o humor.',
  'Dormir bem é fundamental para o equilíbrio hormonal e o bem-estar emocional.',
  'Use roupas íntimas de algodão para manter a saúde da região íntima.',
  'Não tenha vergonha de falar sobre saúde íntima. Informação é poder!',
  'Mantenha seus exames preventivos em dia. A prevenção salva vidas.',
  'Alimentação rica em ferro ajuda durante o período menstrual.',
];

export const quickActions: QuickAction[] = [
  { id: 'menstruacao', label: 'Registrar menstruação', icon: '🩸' },
  { id: 'sintomas', label: 'Registrar sintomas', icon: '📋' },
  { id: 'corrimento', label: 'Registrar corrimento', icon: '💧' },
  { id: 'colica', label: 'Registrar cólica', icon: '🔥' },
  { id: 'humor', label: 'Registrar humor', icon: '😊' },
  { id: 'lembrete', label: 'Adicionar lembrete', icon: '🔔' },
  { id: 'pergunta', label: 'Pergunta anônima', icon: '💬' },
  { id: 'conteudo', label: 'Ler conteúdo', icon: '📖' },
];

export const lifeStageTracks: LifeStageTrack[] = [
  { id: 'adolescencia', label: 'Adolescência', icon: '🌱', age: '10-19 anos', description: 'Descobertas, primeira menstruação e autocuidado.' },
  { id: 'adulta', label: 'Fase adulta', icon: '🌸', age: '20-39 anos', description: 'Saúde reprodutiva, prevenção e equilíbrio.' },
  { id: 'tentando', label: 'Tentando engravidar', icon: '🤞', age: '', description: 'Fertilidade, ovulação e preparação para a gestação.' },
  { id: 'gestacao', label: 'Gestação e pós-parto', icon: '🤰', age: '', description: 'Pré-natal, parto e puerpério.' },
  { id: 'climaterio', label: 'Climatério e menopausa', icon: '🍂', age: '40-65 anos', description: 'Transição hormonal e qualidade de vida.' },
  { id: 'senescencia', label: 'Senescência', icon: '🌺', age: '65+ anos', description: 'Saúde integral e envelhecimento ativo.' },
  { id: 'cronicas', label: 'Condições crônicas', icon: '💜', age: '', description: 'Cuidados especiais e acompanhamento contínuo.' },
];

export const chatResponses: Record<string, string> = {
  corrimento: 'O corrimento vaginal faz parte da saúde íntima da mulher. Se for transparente ou esbranquiçado, sem cheiro forte, geralmente é normal. Se notar mudança de cor, cheiro ou coceira, é importante procurar sua UBS para avaliação. 💜',
  colica: 'A cólica menstrual é muito comum e geralmente não indica problema de saúde. Compressas mornas, chás de camomila e exercícios leves podem ajudar. Se a dor for muito intensa ou não melhorar, procure sua UBS. 🌸',
  atraso: 'Atrasos de até 7 dias podem ser normais. Estresse, mudanças na rotina e alimentação podem influenciar. Se tiver vida sexual ativa, faça um teste de gravidez. Se o atraso persistir por mais de 15 dias, procure sua UBS. 💕',
  normal: 'Cada corpo é único e muitas variações são completamente normais! Se algo te preocupa, anote os sintomas e converse com um profissional de saúde na sua UBS. Não tenha vergonha, eles estão lá para ajudar. 🌷',
  default: 'Obrigada por compartilhar! Lembre-se que este app oferece orientações gerais. Para uma avaliação personalizada, procure sua UBS. Os profissionais de saúde estão preparados para te acolher e orientar. 💜',
};
