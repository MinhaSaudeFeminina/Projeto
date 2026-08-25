export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  age: number;
  lifeStage: string;
  cycleAverageDays: number;
  periodAverageDays: number;
  lastPeriodDate: string;
  notificationsEnabled: boolean;
  dataSharingEnabled: boolean;
  cyclesRecorded: number;
  regularity: string;
}

export interface SymptomType {
  id: string;
  label: string;
  icon: string;
}

export type SymptomIntensity = "leve" | "moderado" | "intenso";

export interface SymptomEntry {
  id: string;
  userId: string;
  type: string;
  intensity: SymptomIntensity;
  notes: string;
  date: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  type: string;
  date: string;
  completed: boolean;
}

export interface PeriodRange {
  startDate: string;
  endDate: string;
}

export interface ContentCategory {
  id: string;
  label: string;
  icon: string;
  color: "rosa" | "lilas" | "roxo" | "magenta" | "fertile";
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
}

export interface LifeStage {
  id: string;
  label: string;
  icon: string;
  age: string;
  description: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
}

export interface AnonymousMessage {
  id: string;
  text: string;
  isUser: boolean;
}

export const mockUser: UserProfile = {
  id: "1",
  name: "Maria",
  email: "maria@email.com",
  photo: null,
  age: 28,
  lifeStage: "adulta",
  cycleAverageDays: 28,
  periodAverageDays: 5,
  lastPeriodDate: "2026-03-05",
  notificationsEnabled: true,
  dataSharingEnabled: false,
  cyclesRecorded: 12,
  regularity: "Regular",
};

export const mockSymptomTypes = [
  { id: "colica", label: "Cólica", icon: "🔥" },
  { id: "dor_pelvica", label: "Dor pélvica", icon: "💫" },
  { id: "corrimento", label: "Corrimento", icon: "💧" },
  { id: "sangramento", label: "Sangramento fora do período", icon: "🩸" },
  { id: "ardor_urina", label: "Ardor ao urinar", icon: "⚡" },
  { id: "dor_mamas", label: "Dor nas mamas", icon: "😣" },
  { id: "humor", label: "Humor alterado", icon: "😢" },
  { id: "ansiedade", label: "Ansiedade", icon: "😰" },
  { id: "irritabilidade", label: "Irritabilidade", icon: "😤" },
  { id: "sono", label: "Alteração no sono", icon: "😴" },
  { id: "inchaco", label: "Inchaço", icon: "🫧" },
  { id: "dor_cabeca", label: "Dor de cabeça", icon: "🤕" },
  { id: "libido", label: "Libido alterada", icon: "💕" },
  { id: "outros", label: "Outros", icon: "📝" },
];

export const mockSymptoms = [
  { id: "1", userId: "1", type: "colica", intensity: "leve" as const, notes: "", date: "2026-03-19" },
  { id: "2", userId: "1", type: "humor", intensity: "moderado" as const, notes: "Me sentindo mais sensível", date: "2026-03-19" },
];

export const mockReminders = [
  { id: "1", userId: "1", title: "Exame preventivo", type: "exame", date: "2026-04-10", completed: false },
  { id: "2", userId: "1", title: "Mamografia anual", type: "exame", date: "2026-05-15", completed: false },
  { id: "3", userId: "1", title: "Consulta ginecológica", type: "consulta", date: "2026-03-25", completed: false },
  { id: "4", userId: "1", title: "Vacina HPV - 2ª dose", type: "vacina", date: "2026-04-20", completed: false },
];

export const mockPeriods = [
  { startDate: "2026-01-08", endDate: "2026-01-12" },
  { startDate: "2026-02-05", endDate: "2026-02-09" },
  { startDate: "2026-03-05", endDate: "2026-03-09" },
];

export const contentCategories = [
  { id: "menstruacao", label: "Menstruação", icon: "🩸", color: "rosa" },
  { id: "contracepcao", label: "Contracepção", icon: "💊", color: "lilas" },
  { id: "gravidez", label: "Gravidez", icon: "🤰", color: "rosa" },
  { id: "saude_intima", label: "Saúde íntima", icon: "🌸", color: "magenta" },
  { id: "cancer_mama", label: "Câncer de mama", icon: "🎀", color: "rosa" },
  { id: "cancer_colo", label: "Câncer de colo", icon: "🔬", color: "roxo" },
  { id: "tpm", label: "TPM e emoções", icon: "🌙", color: "lilas" },
  { id: "climaterio", label: "Climatério", icon: "🌿", color: "fertile" },
  { id: "autocuidado", label: "Autocuidado", icon: "🧘", color: "lilas" },
  { id: "violencia", label: "Violência", icon: "🛡️", color: "roxo" },
];

export interface ContentArticle {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  normalText: string;
  ubsText: string;
  homeCareText: string;
}

export const mockContents: ContentArticle[] = [
  {
    id: "1",
    categoryId: "saude_intima",
    title: "Corrimento vaginal",
    summary: "Entenda o que é normal e quando procurar ajuda médica.",
    normalText: "O corrimento vaginal transparente ou esbranquiçado, sem cheiro forte, é completamente normal e faz parte da saúde íntima da mulher. Ele ajuda a manter a vagina limpa e protegida contra infecções. A quantidade e a consistência podem variar ao longo do ciclo menstrual.",
    ubsText: "Procure a UBS se o corrimento tiver cor amarelada, esverdeada ou acinzentada, cheiro forte e desagradável, coceira intensa, ardor ou dor. Esses sinais podem indicar infecção e precisam de avaliação médica.",
    homeCareText: "Use roupas íntimas de algodão, evite duchas vaginais, lave a região íntima apenas com água ou sabonete neutro, evite roupas muito apertadas e mantenha a região seca.",
  },
  {
    id: "2",
    categoryId: "menstruacao",
    title: "Cólica menstrual",
    summary: "Saiba o que causa e como aliviar as dores.",
    normalText: "A cólica menstrual é uma dor na parte baixa da barriga que acontece antes ou durante a menstruação. É muito comum e na maioria das vezes não indica problema de saúde. A dor acontece porque o útero se contrai para eliminar o endométrio.",
    ubsText: "Procure a UBS se a cólica for muito forte e não melhorar com medicamentos comuns, se a dor atrapalhar suas atividades diárias, se vier acompanhada de febre ou sangramento muito intenso.",
    homeCareText: "Aplique compressas mornas na barriga, tome chás como camomila ou gengibre, pratique exercícios leves como caminhada, descanse quando possível e mantenha-se hidratada.",
  },
  {
    id: "3",
    categoryId: "menstruacao",
    title: "Atraso menstrual",
    summary: "Possíveis causas e quando se preocupar.",
    normalText: "Atrasos de até 7 dias são considerados normais, especialmente em adolescentes e mulheres próximas à menopausa. Estresse, mudanças de peso, exercícios intensos e viagens podem causar atrasos temporários.",
    ubsText: "Procure a UBS se o atraso for maior que 15 dias e você tiver vida sexual ativa, se não menstruar por 3 meses seguidos, ou se tiver outros sintomas como dor intensa ou sangramento anormal.",
    homeCareText: "Faça um teste de gravidez se tiver vida sexual ativa, observe se está passando por estresse ou mudanças de rotina, mantenha uma alimentação equilibrada e anote as datas da menstruação.",
  },
  {
    id: "4",
    categoryId: "menstruacao",
    title: "Sangramento fora do período",
    summary: "Entenda as possíveis causas do sangramento entre menstruações.",
    normalText: "Pequenos sangramentos entre menstruações (spotting) podem ser normais em algumas situações, como no início do uso de anticoncepcionais ou durante a ovulação. Geralmente são leves e duram poucos dias.",
    ubsText: "Procure a UBS se o sangramento for intenso, durar mais de 3 dias, vier acompanhado de dor, acontecer após relação sexual ou se você estiver na menopausa.",
    homeCareText: "Anote quando o sangramento acontece, a quantidade e se há outros sintomas. Essas informações ajudarão o profissional de saúde na avaliação.",
  },
  {
    id: "5",
    categoryId: "saude_intima",
    title: "Dor ou ardor ao urinar",
    summary: "Causas comuns e quando buscar atendimento.",
    normalText: "A dor ou ardor ao urinar pode acontecer ocasionalmente por desidratação ou irritação local. Beber bastante água e manter a higiene adequada costuma resolver esses casos simples.",
    ubsText: "Procure a UBS se a dor for constante, vier acompanhada de febre, sangue na urina, necessidade frequente de urinar ou dor na parte baixa da barriga. Pode ser infecção urinária.",
    homeCareText: "Beba bastante água (pelo menos 2 litros por dia), não segure a urina por muito tempo, faça a higiene sempre de frente para trás e evite produtos perfumados na região íntima.",
  },
  {
    id: "6",
    categoryId: "menstruacao",
    title: "Conheça seu ciclo menstrual",
    summary: "Entenda as fases do ciclo e como acompanhá-lo.",
    normalText: "O ciclo menstrual dura em média 28 dias, mas pode variar de 21 a 35 dias. Ele tem 4 fases: menstrual, folicular, ovulatória e lútea. Conhecer seu ciclo ajuda a entender melhor seu corpo e identificar mudanças.",
    ubsText: "Procure a UBS se seu ciclo for menor que 21 dias ou maior que 35 dias de forma constante, se a menstruação durar mais de 7 dias, ou se você tiver dúvidas sobre seu padrão menstrual.",
    homeCareText: "Use este aplicativo para anotar o início e fim da menstruação, observe mudanças no corrimento ao longo do mês, preste atenção aos sintomas em cada fase e compartilhe essas informações nas consultas.",
  },
  {
    id: "7",
    categoryId: "tpm",
    title: "TPM e alterações emocionais",
    summary: "Como lidar com as mudanças de humor antes da menstruação.",
    normalText: "A TPM (Tensão Pré-Menstrual) acontece nos dias antes da menstruação e pode incluir irritabilidade, tristeza, ansiedade, inchaço, dor nas mamas e vontade de comer doces. É muito comum e geralmente melhora quando a menstruação começa.",
    ubsText: "Procure a UBS se os sintomas de TPM forem muito intensos e atrapalharem sua vida diária, seus relacionamentos ou trabalho. Pode ser TDPM (Transtorno Disfórico Pré-Menstrual), que precisa de acompanhamento.",
    homeCareText: "Pratique exercícios físicos regularmente, reduza o consumo de sal, cafeína e álcool nos dias antes da menstruação, durma bem, pratique atividades relaxantes e seja gentil consigo mesma nesse período.",
  },
  {
    id: "8",
    categoryId: "cancer_colo",
    title: "Prevenção do câncer de colo do útero",
    summary: "Saiba como se prevenir e quando fazer exames.",
    normalText: "O câncer de colo do útero é causado principalmente pelo HPV. A prevenção inclui vacinação contra HPV, uso de preservativo e realização regular do exame preventivo (Papanicolau). Quando detectado cedo, tem alta chance de cura.",
    ubsText: "Procure a UBS para fazer o exame preventivo a partir dos 25 anos (ou antes, se já tiver vida sexual). Repita a cada 3 anos após dois exames normais consecutivos. Vacine-se contra HPV se tiver até 45 anos.",
    homeCareText: "Use preservativo nas relações sexuais, mantenha o calendário de exames em dia, converse com seu parceiro(a) sobre saúde sexual e incentive meninas de 9 a 14 anos a se vacinarem.",
  },
  {
    id: "9",
    categoryId: "cancer_mama",
    title: "Prevenção do câncer de mama",
    summary: "Autocuidado e rastreio para proteção da saúde mamária.",
    normalText: "O autoexame das mamas ajuda a conhecer seu corpo e identificar mudanças. Deve ser feito mensalmente, de preferência após a menstruação. Observe e apalpe as mamas no espelho e deitada.",
    ubsText: "Procure a UBS se notar caroço nas mamas ou axilas, mudança no formato ou tamanho da mama, alteração na pele (vermelhidão, casca de laranja), saída de líquido pelo mamilo ou dor persistente. A mamografia é recomendada a partir dos 50 anos, a cada 2 anos.",
    homeCareText: "Faça o autoexame mensalmente, mantenha uma alimentação saudável, pratique exercícios físicos, evite o consumo excessivo de álcool e mantenha um peso saudável.",
  },
  {
    id: "10",
    categoryId: "violencia",
    title: "Violência contra a mulher",
    summary: "Você não está sozinha. Saiba onde buscar ajuda.",
    normalText: "A violência contra a mulher pode ser física, psicológica, sexual, patrimonial ou moral. Nenhuma forma de violência é aceitável. Você merece respeito e segurança.",
    ubsText: "Na UBS, você pode relatar situações de violência com sigilo e sem julgamentos. Os profissionais de saúde estão preparados para acolher e orientar. Você também pode ligar para o 180 (Central de Atendimento à Mulher) ou 190 (Polícia).",
    homeCareText: "Se você está em situação de violência: ligue 180 (24h, gratuito e sigiloso), vá a uma delegacia da mulher, procure o CRAS ou CREAS da sua cidade, converse com alguém de confiança. Você não precisa passar por isso sozinha.",
  },
  {
    id: "11",
    categoryId: "climaterio",
    title: "Climatério e menopausa",
    summary: "Entenda essa fase natural da vida e como viver bem.",
    normalText: "O climatério é a transição entre a fase reprodutiva e a não reprodutiva, geralmente entre 40 e 65 anos. A menopausa é a última menstruação. Sintomas como ondas de calor, alterações no sono e mudanças de humor são comuns.",
    ubsText: "Procure a UBS para acompanhamento durante o climatério, especialmente se os sintomas afetarem sua qualidade de vida. O profissional pode orientar sobre tratamentos e cuidados específicos.",
    homeCareText: "Pratique exercícios físicos regulares, mantenha alimentação rica em cálcio e vitamina D, evite cigarro e álcool, use roupas leves, mantenha o ambiente fresco e cuide da saúde emocional.",
  },
  {
    id: "12",
    categoryId: "autocuidado",
    title: "Autocuidado e hábitos saudáveis",
    summary: "Pequenos cuidados diários fazem grande diferença.",
    normalText: "O autocuidado envolve atenção ao corpo e à mente. Alimentação equilibrada, exercícios físicos, sono adequado, hidratação e momentos de lazer são fundamentais para a saúde da mulher em todas as fases da vida.",
    ubsText: "Procure a UBS para check-ups regulares, vacinação em dia, rastreio de doenças e orientação nutricional. A prevenção é o melhor caminho para uma vida saudável.",
    homeCareText: "Beba pelo menos 2 litros de água por dia, durma de 7 a 9 horas, coma frutas, verduras e legumes, faça exercícios pelo menos 30 minutos por dia, reserve tempo para atividades que te fazem bem e cuide da saúde mental.",
  },
];

export const healthTips = [
  "Beba pelo menos 2 litros de água por dia para manter seu corpo hidratado e saudável.",
  "O autoexame das mamas deve ser feito mensalmente. Conheça seu corpo!",
  "Exercícios físicos regulares ajudam a aliviar cólicas e melhorar o humor.",
  "Dormir bem é fundamental para o equilíbrio hormonal e o bem-estar emocional.",
  "Use roupas íntimas de algodão para manter a saúde da região íntima.",
  "Não tenha vergonha de falar sobre saúde íntima. Informação é poder!",
  "Mantenha seus exames preventivos em dia. A prevenção salva vidas.",
  "Alimentação rica em ferro ajuda durante o período menstrual.",
];

export const quickActions = [
  { id: "menstruacao", label: "Registrar menstruação", icon: "🩸" },
  { id: "sintomas", label: "Registrar sintomas", icon: "📋" },
  { id: "corrimento", label: "Registrar corrimento", icon: "💧" },
  { id: "colica", label: "Registrar cólica", icon: "🔥" },
  { id: "humor", label: "Registrar humor", icon: "😊" },
  { id: "lembrete", label: "Adicionar lembrete", icon: "🔔" },
  { id: "pergunta", label: "Pergunta anônima", icon: "💬" },
  { id: "conteudo", label: "Ler conteúdo", icon: "📖" },
];

export const lifeStages = [
  { id: "adolescencia", label: "Adolescência", icon: "🌱", age: "10-19 anos", description: "Descobertas, primeira menstruação e autocuidado." },
  { id: "adulta", label: "Fase adulta", icon: "🌸", age: "20-39 anos", description: "Saúde reprodutiva, prevenção e equilíbrio." },
  { id: "tentando", label: "Tentando engravidar", icon: "🤞", age: "", description: "Fertilidade, ovulação e preparação para a gestação." },
  { id: "gestacao", label: "Gestação e pós-parto", icon: "🤰", age: "", description: "Pré-natal, parto e puerpério." },
  { id: "climaterio", label: "Climatério e menopausa", icon: "🍂", age: "40-65 anos", description: "Transição hormonal e qualidade de vida." },
  { id: "senescencia", label: "Senescência", icon: "🌺", age: "65+ anos", description: "Saúde integral e envelhecimento ativo." },
  { id: "cronicas", label: "Condições crônicas", icon: "💜", age: "", description: "Cuidados especiais e acompanhamento contínuo." },
];

export const emergencyContacts = [
  { name: "Central de Atendimento à Mulher", number: "180", description: "24h, gratuito e sigiloso" },
  { name: "SAMU", number: "192", description: "Urgências e emergências" },
  { name: "Polícia Militar", number: "190", description: "Emergências" },
  { name: "CVV - Apoio Emocional", number: "188", description: "24h, gratuito e sigiloso" },
  { name: "Disque Saúde", number: "136", description: "Informações sobre saúde" },
];

export const chatResponses: Record<string, string> = {
  corrimento: "O corrimento vaginal faz parte da saúde íntima da mulher. Se for transparente ou esbranquiçado, sem cheiro forte, geralmente é normal. Se notar mudança de cor, cheiro ou coceira, é importante procurar sua UBS para avaliação. 💜",
  colica: "A cólica menstrual é muito comum e geralmente não indica problema de saúde. Compressas mornas, chás de camomila e exercícios leves podem ajudar. Se a dor for muito intensa ou não melhorar, procure sua UBS. 🌸",
  atraso: "Atrasos de até 7 dias podem ser normais. Estresse, mudanças na rotina e alimentação podem influenciar. Se tiver vida sexual ativa, faça um teste de gravidez. Se o atraso persistir por mais de 15 dias, procure sua UBS. 💕",
  normal: "Cada corpo é único e muitas variações são completamente normais! Se algo te preocupa, anote os sintomas e converse com um profissional de saúde na sua UBS. Não tenha vergonha, eles estão lá para ajudar. 🌷",
  default: "Obrigada por compartilhar! Lembre-se que este app oferece orientações gerais. Para uma avaliação personalizada, procure sua UBS. Os profissionais de saúde estão preparados para te acolher e orientar. 💜",
};
