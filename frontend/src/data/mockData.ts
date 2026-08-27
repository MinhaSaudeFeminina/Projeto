import type { AdminUser, ContentCategory, Content, LifeStage, Symptom, Reminder, AppUser, Notification, SupportContact } from '@/types';

export const adminUsers: AdminUser[] = [
  { id: '1', name: 'Ana Silva', email: 'ana@saude.gov.br', role: 'admin', isActive: true, lastLogin: '2026-03-19T10:00:00', createdAt: '2025-01-01', avatar: '' },
  { id: '2', name: 'Dra. Maria Santos', email: 'maria@saude.gov.br', role: 'profissional', isActive: true, lastLogin: '2026-03-18T14:30:00', createdAt: '2025-02-15' },
  { id: '3', name: 'Carla Oliveira', email: 'carla@saude.gov.br', role: 'editor', isActive: true, lastLogin: '2026-03-17T09:00:00', createdAt: '2025-03-10' },
  { id: '4', name: 'Juliana Costa', email: 'juliana@saude.gov.br', role: 'visualizador', isActive: true, lastLogin: '2026-03-16T11:00:00', createdAt: '2025-04-20' },
  { id: '5', name: 'Patricia Lima', email: 'patricia@saude.gov.br', role: 'editor', isActive: false, lastLogin: '2026-02-01T08:00:00', createdAt: '2025-05-05' },
];

export const categories: ContentCategory[] = [
  { id: '1', name: 'Menstruação', description: 'Informações sobre o ciclo menstrual', color: '#E91E63', icon: 'Droplets', order: 1, isActive: true },
  { id: '2', name: 'Contracepção', description: 'Métodos contraceptivos', color: '#9C27B0', icon: 'Shield', order: 2, isActive: true },
  { id: '4', name: 'Saúde íntima', description: 'Cuidados com saúde íntima', color: '#E91E63', icon: 'Heart', order: 4, isActive: true },
  { id: '5', name: 'Câncer de mama', description: 'Prevenção e informações', color: '#F06292', icon: 'Ribbon', order: 5, isActive: true },
  { id: '6', name: 'Câncer de colo do útero', description: 'Prevenção e informações', color: '#AB47BC', icon: 'Stethoscope', order: 6, isActive: true },
  { id: '7', name: 'TPM e emoções', description: 'Aspectos emocionais do ciclo', color: '#7E57C2', icon: 'Brain', order: 7, isActive: true },
  { id: '8', name: 'Climatério e menopausa', description: 'Transição hormonal', color: '#8D6E63', icon: 'Flower2', order: 8, isActive: true },
  { id: '9', name: 'Autocuidado', description: 'Práticas de bem-estar', color: '#26A69A', icon: 'Sparkles', order: 9, isActive: true },
  { id: '10', name: 'Violência contra a mulher', description: 'Apoio e orientação', color: '#EF5350', icon: 'HandHeart', order: 10, isActive: true },
];

export const contents: Content[] = [
  { id: '1', title: 'Corrimento vaginal: o que é normal e quando se preocupar', slug: 'corrimento-vaginal', categoryId: '4', summary: 'Entenda os diferentes tipos de corrimento e quando buscar ajuda médica.', body: '<p>O corrimento vaginal é algo natural do corpo feminino...</p>', normalText: 'Corrimento claro ou esbranquiçado, sem odor forte, é considerado normal.', ubsText: 'Procure a UBS se o corrimento tiver cor amarelada, esverdeada, odor forte ou vier acompanhado de coceira.', homeCareText: 'Mantenha a higiene íntima com sabonete neutro. Evite duchas vaginais.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['corrimento', 'saúde íntima', 'ginecologia'], status: 'publicado', authorId: '3', reviewerId: '2', publishedAt: '2026-03-01', createdAt: '2026-02-20', updatedAt: '2026-03-01' },
  { id: '2', title: 'Cólica menstrual: causas e alívio', slug: 'colica-menstrual', categoryId: '1', summary: 'Saiba por que a cólica acontece e como aliviar.', body: '<p>A cólica menstrual (dismenorreia) é causada por contrações uterinas...</p>', normalText: 'Cólicas leves a moderadas durante a menstruação são comuns.', ubsText: 'Procure a UBS se a cólica for muito intensa ou impedir atividades do dia a dia.', homeCareText: 'Compressas mornas na barriga, chás de camomila e exercícios leves podem ajudar.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['cólica', 'menstruação', 'dor'], status: 'publicado', authorId: '3', reviewerId: '2', publishedAt: '2026-03-02', createdAt: '2026-02-21', updatedAt: '2026-03-02' },
  { id: '3', title: 'Atraso menstrual: possíveis causas', slug: 'atraso-menstrual', categoryId: '1', summary: 'Entenda as causas mais comuns do atraso menstrual.', body: '<p>O atraso menstrual pode ter diversas causas...</p>', normalText: 'Variações de até 7 dias no ciclo são consideradas normais.', ubsText: 'Procure a UBS se o atraso for superior a 15 dias ou vier acompanhado de outros sintomas.', homeCareText: 'Mantenha um registro do seu ciclo menstrual. Reduza o estresse.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['atraso', 'menstruação', 'ciclo'], status: 'publicado', authorId: '3', publishedAt: '2026-03-03', createdAt: '2026-02-22', updatedAt: '2026-03-03' },
  { id: '4', title: 'Sangramento fora do período menstrual', slug: 'sangramento-fora-periodo', categoryId: '1', summary: 'Quando o sangramento entre períodos requer atenção.', body: '<p>Sangramento fora do período menstrual pode ter diferentes causas...</p>', normalText: 'Pequenos sangramentos de escape podem ocorrer em quem usa anticoncepcional.', ubsText: 'Procure a UBS se o sangramento for recorrente, intenso ou vier com dor.', homeCareText: 'Registre quando o sangramento ocorre e a quantidade.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['sangramento', 'escape', 'menstruação'], status: 'em_revisao', authorId: '3', createdAt: '2026-02-25', updatedAt: '2026-03-10' },
  { id: '5', title: 'Dor ou ardor ao urinar', slug: 'dor-ardor-urinar', categoryId: '4', summary: 'Causas comuns e quando procurar atendimento.', body: '<p>A dor ou ardor ao urinar (disúria) é frequente em mulheres...</p>', normalText: 'Desconforto leve após relações sexuais pode ocorrer ocasionalmente.', ubsText: 'Procure a UBS se a dor vier acompanhada de febre, sangue na urina ou dor lombar.', homeCareText: 'Beba bastante água. Não segure a urina por longos períodos.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['urina', 'infecção', 'ITU'], status: 'publicado', authorId: '3', reviewerId: '2', publishedAt: '2026-03-05', createdAt: '2026-02-23', updatedAt: '2026-03-05' },
  { id: '6', title: 'Conheça seu ciclo menstrual', slug: 'conheca-ciclo-menstrual', categoryId: '1', summary: 'Entenda as fases do ciclo e como funciona seu corpo.', body: '<p>O ciclo menstrual é dividido em fases...</p>', normalText: 'Ciclos de 21 a 35 dias são normais. A duração pode variar.', ubsText: 'Procure a UBS se o ciclo for muito irregular ou se notar mudanças persistentes.', homeCareText: 'Use um calendário ou app para acompanhar seu ciclo.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '1', tags: ['ciclo', 'menstruação', 'educação'], status: 'publicado', authorId: '3', reviewerId: '2', publishedAt: '2026-03-06', createdAt: '2026-02-24', updatedAt: '2026-03-06' },
  { id: '7', title: 'TPM e alterações emocionais', slug: 'tpm-alteracoes-emocionais', categoryId: '7', summary: 'Entenda a TPM e como lidar com as mudanças emocionais.', body: '<p>A Tensão Pré-Menstrual (TPM) afeta muitas mulheres...</p>', normalText: 'Alterações leves de humor antes da menstruação são comuns.', ubsText: 'Procure a UBS se os sintomas emocionais forem muito intensos ou afetarem sua qualidade de vida.', homeCareText: 'Exercícios físicos, boa alimentação e sono adequado podem ajudar.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['tpm', 'emoções', 'humor'], status: 'rascunho', authorId: '3', createdAt: '2026-03-10', updatedAt: '2026-03-10' },
  { id: '8', title: 'Prevenção do câncer de colo do útero', slug: 'prevencao-cancer-colo-utero', categoryId: '6', summary: 'Saiba como prevenir o câncer de colo do útero.', body: '<p>O câncer de colo do útero é causado principalmente pelo HPV...</p>', normalText: 'O exame preventivo (Papanicolau) deve ser feito periodicamente.', ubsText: 'Procure a UBS para fazer seu exame preventivo. A vacina HPV está disponível no SUS.', homeCareText: 'Mantenha os exames em dia e converse com seu médico sobre vacinação.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['câncer', 'HPV', 'preventivo'], status: 'publicado', authorId: '2', reviewerId: '2', publishedAt: '2026-03-07', createdAt: '2026-02-26', updatedAt: '2026-03-07' },
  { id: '9', title: 'Prevenção do câncer de mama', slug: 'prevencao-cancer-mama', categoryId: '5', summary: 'Informações sobre detecção precoce do câncer de mama.', body: '<p>O câncer de mama é o tipo mais comum entre mulheres...</p>', normalText: 'Mamas com diferentes texturas e tamanhos são normais.', ubsText: 'Procure a UBS se notar nódulos, alterações na pele da mama ou secreção mamilar.', homeCareText: 'Faça o autoexame regularmente e mantenha a mamografia em dia.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['câncer', 'mama', 'mamografia'], status: 'publicado', authorId: '2', reviewerId: '2', publishedAt: '2026-03-08', createdAt: '2026-02-27', updatedAt: '2026-03-08' },
  { id: '10', title: 'Climatério e menopausa', slug: 'climaterio-menopausa', categoryId: '8', summary: 'Entenda as mudanças do climatério e menopausa.', body: '<p>O climatério é a fase de transição hormonal...</p>', normalText: 'Ondas de calor, alterações de humor e irregularidades menstruais são comuns nessa fase.', ubsText: 'Procure a UBS para acompanhamento ginecológico durante a transição.', homeCareText: 'Atividade física regular, boa alimentação e hidratação são fundamentais.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '5', tags: ['climatério', 'menopausa', 'hormônios'], status: 'em_revisao', authorId: '3', createdAt: '2026-03-12', updatedAt: '2026-03-15' },
  { id: '11', title: 'Autocuidado feminino', slug: 'autocuidado-feminino', categoryId: '9', summary: 'Práticas de autocuidado para o bem-estar da mulher.', body: '<p>O autocuidado vai muito além da estética...</p>', normalText: 'Cuidar de si mesma é parte essencial da saúde.', ubsText: 'Procure a UBS para check-ups regulares e orientações personalizadas.', homeCareText: 'Reserve momentos para si, pratique exercícios e cuide da alimentação.', disclaimer: 'Este conteúdo é educativo e não substitui avaliação médica.', lifeStageId: '2', tags: ['autocuidado', 'bem-estar', 'saúde mental'], status: 'rascunho', authorId: '3', createdAt: '2026-03-14', updatedAt: '2026-03-14' },
  { id: '12', title: 'Violência contra a mulher: onde buscar ajuda', slug: 'violencia-contra-mulher', categoryId: '10', summary: 'Informações sobre apoio e redes de proteção.', body: '<p>A violência contra a mulher tem diversas formas...</p>', normalText: 'Violência não é apenas física. Emocional, patrimonial e sexual também são violência.', ubsText: 'A UBS pode acolher e encaminhar. Você não está sozinha.', homeCareText: 'Ligue 180 (Central de Atendimento à Mulher). É gratuito e sigiloso.', disclaimer: 'Se você está em perigo, ligue imediatamente para o 190 (Polícia).', lifeStageId: '2', tags: ['violência', 'apoio', 'proteção'], status: 'publicado', authorId: '2', reviewerId: '2', publishedAt: '2026-03-09', createdAt: '2026-02-28', updatedAt: '2026-03-09' },
];

export const lifeStages: LifeStage[] = [
  { id: '1', name: 'Adolescência', description: 'Informações para jovens de 10 a 19 anos', contentIds: ['6'], reminderSuggestions: ['Vacina HPV', 'Primeira consulta ginecológica'], warningSignals: ['Menstruação muito irregular após 2 anos', 'Cólicas incapacitantes'], ubsOrientation: 'A UBS oferece atendimento especializado para adolescentes.', order: 1, status: 'publicado' },
  { id: '2', name: 'Fase adulta', description: 'Informações para mulheres de 20 a 39 anos', contentIds: ['1', '2', '3', '4', '5', '7', '8', '9', '11', '12'], reminderSuggestions: ['Exame preventivo anual', 'Consulta ginecológica'], warningSignals: ['Sangramento irregular', 'Dor pélvica persistente'], ubsOrientation: 'Mantenha seus exames em dia na UBS.', order: 2, status: 'publicado' },
  { id: '5', name: 'Climatério e menopausa', description: 'Transição hormonal a partir dos 40 anos', contentIds: ['10'], reminderSuggestions: ['Mamografia bienal', 'Densitometria óssea'], warningSignals: ['Sangramento após a menopausa', 'Ondas de calor intensas'], ubsOrientation: 'A UBS pode acompanhar essa transição.', order: 5, status: 'publicado' },
  { id: '6', name: 'Senescência', description: 'Saúde da mulher idosa', contentIds: [], reminderSuggestions: ['Mamografia', 'Consulta geriátrica'], warningSignals: ['Quedas frequentes', 'Incontinência urinária'], ubsOrientation: 'A UBS oferece atendimento para saúde da mulher idosa.', order: 6, status: 'rascunho' },
  { id: '7', name: 'Mulheres com condições crônicas', description: 'Orientações para mulheres com doenças crônicas', contentIds: [], reminderSuggestions: ['Acompanhamento regular', 'Exames periódicos'], warningSignals: ['Descompensação de sintomas'], ubsOrientation: 'Mantenha acompanhamento regular na UBS.', order: 7, status: 'rascunho' },
];

export const symptoms: Symptom[] = [
  { id: '1', name: 'Cólica', type: 'dor', shortDescription: 'Dor no baixo ventre', fullDescription: 'Dor causada por contrações uterinas durante a menstruação.', icon: 'Flame', category: 'Menstruação', showInApp: true, askIntensity: true, askNotes: true, generateUbsAlert: false, orientationText: 'Cólicas leves são comuns. Compressas mornas podem ajudar.', severityAlertText: 'Cólicas intensas que impedem atividades diárias merecem avaliação médica.', order: 1 },
  { id: '2', name: 'Dor pélvica', type: 'dor', shortDescription: 'Dor na região pélvica', fullDescription: 'Dor persistente na parte inferior do abdômen.', icon: 'AlertTriangle', category: 'Saúde íntima', showInApp: true, askIntensity: true, askNotes: true, generateUbsAlert: true, orientationText: 'Dor pélvica persistente deve ser investigada.', severityAlertText: 'Dor aguda ou com febre exige atendimento urgente.', order: 2 },
  { id: '3', name: 'Corrimento', type: 'secreção', shortDescription: 'Secreção vaginal alterada', fullDescription: 'Mudança na cor, odor ou quantidade do corrimento.', icon: 'Droplets', category: 'Saúde íntima', showInApp: true, askIntensity: false, askNotes: true, generateUbsAlert: false, orientationText: 'Corrimento claro é normal. Mudanças podem indicar infecção.', severityAlertText: 'Corrimento com odor forte, coceira ou cor esverdeada requer avaliação.', order: 3 },
  { id: '4', name: 'Sangramento fora do período', type: 'sangramento', shortDescription: 'Sangramento intermenstrual', fullDescription: 'Sangramento que ocorre fora do período menstrual esperado.', icon: 'Droplet', category: 'Menstruação', showInApp: true, askIntensity: true, askNotes: true, generateUbsAlert: true, orientationText: 'Pode ter diversas causas. Registre quando ocorre.', severityAlertText: 'Sangramento abundante fora do período requer avaliação médica.', order: 4 },
  { id: '5', name: 'Ardor ao urinar', type: 'dor', shortDescription: 'Dor ou queimação ao urinar', fullDescription: 'Sensação de ardência durante a micção.', icon: 'Zap', category: 'Saúde íntima', showInApp: true, askIntensity: true, askNotes: false, generateUbsAlert: true, orientationText: 'Beba bastante água. Pode indicar infecção urinária.', severityAlertText: 'Se acompanhado de febre ou sangue na urina, procure atendimento.', order: 5 },
  { id: '6', name: 'Dor nas mamas', type: 'dor', shortDescription: 'Dor ou sensibilidade mamária', fullDescription: 'Dor, inchaço ou sensibilidade nas mamas.', icon: 'Heart', category: 'Saúde íntima', showInApp: true, askIntensity: true, askNotes: true, generateUbsAlert: false, orientationText: 'Dor mamária antes da menstruação é comum.', severityAlertText: 'Nódulos ou secreção mamilar devem ser avaliados.', order: 6 },
  { id: '7', name: 'Irritabilidade', type: 'emocional', shortDescription: 'Irritação e impaciência', fullDescription: 'Estado de irritação frequente.', icon: 'CloudLightning', category: 'TPM e emoções', showInApp: true, askIntensity: true, askNotes: false, generateUbsAlert: false, orientationText: 'Mudanças de humor pré-menstruais são comuns.', severityAlertText: 'Se afetar significativamente seus relacionamentos, busque apoio.', order: 7 },
  { id: '8', name: 'Ansiedade', type: 'emocional', shortDescription: 'Sensação de ansiedade', fullDescription: 'Preocupação excessiva ou inquietação.', icon: 'Brain', category: 'TPM e emoções', showInApp: true, askIntensity: true, askNotes: true, generateUbsAlert: false, orientationText: 'Técnicas de respiração e exercícios podem ajudar.', severityAlertText: 'Ansiedade intensa e persistente merece acompanhamento profissional.', order: 8 },
  { id: '9', name: 'Insônia', type: 'sono', shortDescription: 'Dificuldade para dormir', fullDescription: 'Dificuldade para iniciar ou manter o sono.', icon: 'Moon', category: 'TPM e emoções', showInApp: true, askIntensity: true, askNotes: false, generateUbsAlert: false, orientationText: 'Mantenha uma rotina de sono e evite telas antes de dormir.', severityAlertText: 'Insônia persistente pode necessitar de avaliação.', order: 9 },
  { id: '10', name: 'Inchaço', type: 'físico', shortDescription: 'Sensação de inchaço', fullDescription: 'Retenção de líquidos e inchaço corporal.', icon: 'Waves', category: 'TPM e emoções', showInApp: true, askIntensity: false, askNotes: false, generateUbsAlert: false, orientationText: 'Reduza o consumo de sal e beba bastante água.', severityAlertText: 'Inchaço persistente ou assimétrico deve ser avaliado.', order: 10 },
  { id: '11', name: 'Dor de cabeça', type: 'dor', shortDescription: 'Cefaleia', fullDescription: 'Dor de cabeça associada ao ciclo hormonal.', icon: 'HeadsetIcon', category: 'TPM e emoções', showInApp: true, askIntensity: true, askNotes: false, generateUbsAlert: false, orientationText: 'Dores de cabeça podem estar ligadas ao ciclo hormonal.', severityAlertText: 'Dor intensa, súbita ou com alteração visual requer atendimento urgente.', order: 11 },
  { id: '12', name: 'Alteração de humor', type: 'emocional', shortDescription: 'Mudanças de humor', fullDescription: 'Oscilações emocionais frequentes.', icon: 'Smile', category: 'TPM e emoções', showInApp: true, askIntensity: true, askNotes: true, generateUbsAlert: false, orientationText: 'Alterações de humor pré-menstruais são comuns.', severityAlertText: 'Se sentir tristeza profunda ou pensamentos negativos, busque ajuda.', order: 12 },
];

export const reminders: Reminder[] = [
  { id: '1', title: 'Exame Preventivo (Papanicolau)', description: 'Lembrete para realização do exame preventivo.', type: 'exame_preventivo', audience: 'Mulheres 25-64 anos', lifeStage: 'Fase adulta', periodicity: 'Anual', startDate: '2026-01-01', shortMessage: 'Está na hora do seu preventivo!', expandedMessage: 'O exame preventivo é essencial para a detecção precoce do câncer de colo do útero. Procure sua UBS para agendar.', isActive: true, priority: 'alta', channel: 'app' },
  { id: '2', title: 'Mamografia', description: 'Lembrete para realização da mamografia.', type: 'mamografia', audience: 'Mulheres 50-69 anos', lifeStage: 'Climatério e menopausa', periodicity: 'Bienal', startDate: '2026-01-01', shortMessage: 'Hora de fazer a mamografia!', expandedMessage: 'A mamografia é fundamental para detecção precoce do câncer de mama.', isActive: true, priority: 'alta', channel: 'app' },
  { id: '3', title: 'Vacina HPV', description: 'Lembrete de vacinação contra HPV.', type: 'vacina_hpv', audience: 'Meninas 9-14 anos', lifeStage: 'Adolescência', periodicity: 'Dose única', startDate: '2026-03-01', endDate: '2026-12-31', shortMessage: 'A vacina HPV protege contra o câncer!', expandedMessage: 'A vacina HPV está disponível gratuitamente no SUS para meninas de 9 a 14 anos.', isActive: true, priority: 'media', channel: 'app' },
  { id: '4', title: 'Outubro Rosa', description: 'Campanha de conscientização sobre o câncer de mama.', type: 'campanha', audience: 'Todas as usuárias', lifeStage: 'Todas', periodicity: 'Anual', startDate: '2026-10-01', endDate: '2026-10-31', shortMessage: 'Outubro Rosa: cuide-se!', expandedMessage: 'Outubro é o mês de conscientização sobre o câncer de mama. Faça seus exames!', isActive: true, priority: 'alta', channel: 'app' },
  { id: '5', title: 'Autoexame das mamas', description: 'Lembrete mensal para autoobservação das mamas.', type: 'autoexame', audience: 'Todas as usuárias', lifeStage: 'Todas', periodicity: 'Mensal', startDate: '2026-01-01', shortMessage: 'Hora do autoexame!', expandedMessage: 'Observe suas mamas regularmente. Conheça o que é normal para você.', isActive: true, priority: 'media', channel: 'app' },
];

export const appUsers: AppUser[] = [
  { id: '1', name: 'Mariana S.', email: 'mariana@email.com', age: 28, lifeStage: 'Fase adulta', city: 'São Paulo', status: 'ativo', notificationsActive: true, lastAccess: '2026-03-19T08:00:00', createdAt: '2025-06-01' },
  { id: '3', name: 'Julia M.', email: 'julia@email.com', age: 16, lifeStage: 'Adolescência', city: 'Belo Horizonte', status: 'ativo', notificationsActive: false, lastAccess: '2026-03-17T15:00:00', createdAt: '2025-09-20' },
  { id: '4', name: 'Regina C.', email: 'regina@email.com', age: 52, lifeStage: 'Climatério e menopausa', city: 'Curitiba', status: 'ativo', notificationsActive: true, lastAccess: '2026-03-16T12:00:00', createdAt: '2025-10-05' },
  { id: '5', name: 'Camila R.', email: 'camila@email.com', age: 22, lifeStage: 'Fase adulta', status: 'inativo', notificationsActive: false, lastAccess: '2026-01-10T09:00:00', createdAt: '2025-11-30' },
  { id: '7', name: 'Sandra L.', email: 'sandra@email.com', age: 45, lifeStage: 'Fase adulta', city: 'Fortaleza', status: 'ativo', notificationsActive: true, lastAccess: '2026-03-15T18:00:00', createdAt: '2025-12-01' },
  { id: '8', name: 'Isabela F.', email: 'isabela@email.com', age: 19, lifeStage: 'Adolescência', city: 'Recife', status: 'ativo', notificationsActive: true, lastAccess: '2026-03-18T21:00:00', createdAt: '2026-01-10' },
];

export const notifications: Notification[] = [
  { id: '1', title: 'Bem-vinda ao Minha Saúde Feminina!', message: 'Conheça todas as funcionalidades do app.', audience: 'Novas usuárias', segment: 'todas', category: 'Boas-vindas', status: 'enviada', ctaLabel: 'Explorar', ctaLink: '/home', createdAt: '2026-03-01', deliveryRate: 98, openRate: 72 },
  { id: '2', title: 'Novo conteúdo: Prevenção do Câncer de Mama', message: 'Acesse agora informações importantes sobre a prevenção.', audience: 'Todas', segment: 'todas', category: 'Conteúdo', status: 'enviada', ctaLabel: 'Ler agora', ctaLink: '/content/9', createdAt: '2026-03-08', deliveryRate: 95, openRate: 45 },
  { id: '3', title: 'Lembrete: Exame Preventivo', message: 'Já fez seu preventivo este ano? Agende na sua UBS!', audience: 'Mulheres 25-64', segment: 'fase_adulta', category: 'Saúde', status: 'agendada', scheduleDate: '2026-04-01', ctaLabel: 'Saiba mais', ctaLink: '/reminders', createdAt: '2026-03-15' },
  { id: '4', title: 'Campanha Março Lilás', message: 'Mês de conscientização sobre o câncer de colo do útero.', audience: 'Todas', segment: 'todas', category: 'Campanha', status: 'enviada', ctaLabel: 'Participar', ctaLink: '/campaign/marco-lilas', createdAt: '2026-03-01', deliveryRate: 96, openRate: 38 },
  { id: '5', title: 'Novidade: Trilhas por Fase da Vida', message: 'Conteúdos personalizados para cada fase.', audience: 'Todas', segment: 'todas', category: 'Funcionalidade', status: 'rascunho', createdAt: '2026-03-18' },
];

export const supportContacts: SupportContact[] = [
  { id: '1', name: 'Central de Atendimento à Mulher', description: 'Ligue 180 para denúncias e orientações sobre violência contra a mulher.', phone: '180', type: 'emergencia', ctaLabel: 'Ligar agora', isHighlighted: true, isActive: true },
  { id: '2', name: 'UBS - Unidade Básica de Saúde', description: 'Encontre a UBS mais próxima para atendimento de saúde.', type: 'saude', link: 'https://ubs.saude.gov.br', ctaLabel: 'Encontrar UBS', isHighlighted: true, isActive: true },
  { id: '3', name: 'SAMU - Serviço de Atendimento Móvel de Urgência', description: 'Para emergências médicas, ligue 192.', phone: '192', type: 'emergencia', ctaLabel: 'Ligar 192', isHighlighted: false, isActive: true },
  { id: '4', name: 'CVV - Centro de Valorização da Vida', description: 'Apoio emocional e prevenção do suicídio. Ligue 188.', phone: '188', type: 'apoio_psicologico', ctaLabel: 'Ligar 188', isHighlighted: false, isActive: true },
  { id: '5', name: 'Delegacia da Mulher', description: 'Atendimento especializado para mulheres vítimas de violência.', type: 'seguranca', ctaLabel: 'Encontrar delegacia', isHighlighted: false, isActive: true },
  { id: '6', name: 'CRAS - Centro de Referência de Assistência Social', description: 'Assistência social e proteção às famílias.', type: 'assistencia_social', ctaLabel: 'Saiba mais', isHighlighted: false, isActive: true },
];

export const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor de Conteúdo',
  profissional: 'Profissional da Saúde',
  visualizador: 'Visualizador/Gestor',
};

export const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  em_revisao: 'Em revisão',
  publicado: 'Publicado',
  arquivado: 'Arquivado',
  nova: 'Nova',
  em_analise: 'Em análise',
  respondida: 'Respondida',
  arquivada: 'Arquivada',
  agendada: 'Agendada',
  enviada: 'Enviada',
  cancelada: 'Cancelada',
};

export const statusColors: Record<string, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  em_revisao: 'bg-warning/20 text-warning-foreground',
  publicado: 'bg-success/20 text-success',
  arquivado: 'bg-muted text-muted-foreground',
  nova: 'bg-info/20 text-info',
  em_analise: 'bg-warning/20 text-warning-foreground',
  respondida: 'bg-success/20 text-success',
  arquivada: 'bg-muted text-muted-foreground',
  agendada: 'bg-info/20 text-info',
  enviada: 'bg-success/20 text-success',
  cancelada: 'bg-destructive/20 text-destructive',
  ativo: 'bg-success/20 text-success',
  inativo: 'bg-muted text-muted-foreground',
};

export const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const priorityColors: Record<string, string> = {
  baixa: 'bg-muted text-muted-foreground',
  media: 'bg-info/20 text-info',
  alta: 'bg-warning/20 text-warning-foreground',
  urgente: 'bg-destructive/20 text-destructive',
};
