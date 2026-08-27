/**
 * The symptom catalog as it ships with the app, mirroring
 * `backend/database/seeders/SymptomCatalogSeeder.php`. It is seeded into SQLite
 * on first launch so the symptom list works offline and on the very first run,
 * before any request to the API has a chance to answer.
 *
 * `key` is a slug rather than the backend's numeric id: it stays stable across
 * catalog refreshes, so a symptom the user already logged can never be orphaned
 * by an admin editing the catalog.
 */
export type SymptomSeed = {
  key: string;
  name: string;
  category: string;
  shortDescription: string;
  isAlertCandidate: boolean;
  askIntensity: boolean;
  orientationText: string;
  severityAlertText: string;
  sortOrder: number;
};

const orientation =
  'Registre quando ocorreu e converse com uma profissional de saúde se a queixa persistir ou piorar.';
const alertText =
  'Se a queixa for intensa, súbita ou vier com outros sinais importantes, procure atendimento profissional.';
const routineText =
  'Procure avaliação profissional se a queixa for intensa, persistente ou afetar suas atividades.';

function seed(
  sortOrder: number,
  key: string,
  name: string,
  shortDescription: string,
  category: string,
  isAlertCandidate: boolean,
  askIntensity: boolean,
): SymptomSeed {
  return {
    askIntensity,
    category,
    isAlertCandidate,
    key,
    name,
    orientationText: orientation,
    severityAlertText: isAlertCandidate ? alertText : routineText,
    shortDescription,
    sortOrder,
  };
}

export const symptomCatalogSeed: SymptomSeed[] = [
  seed(1, 'colica', 'Cólica', 'Dor no baixo ventre.', 'Menstruação', false, true),
  seed(2, 'dor-pelvica', 'Dor pélvica', 'Dor na região pélvica.', 'Saúde íntima', true, true),
  seed(3, 'corrimento', 'Corrimento', 'Alteração de secreção vaginal.', 'Saúde íntima', false, false),
  seed(4, 'sangramento-fora-do-periodo', 'Sangramento fora do período', 'Sangramento fora do período esperado.', 'Menstruação', true, true),
  seed(5, 'ardor-ao-urinar', 'Ardor ao urinar', 'Dor ou queimação ao urinar.', 'Saúde íntima', true, true),
  seed(6, 'dor-nas-mamas', 'Dor nas mamas', 'Dor ou sensibilidade mamária.', 'Saúde íntima', false, true),
  seed(7, 'irritabilidade', 'Irritabilidade', 'Irritação ou impaciência.', 'TPM e emoções', false, true),
  seed(8, 'ansiedade', 'Ansiedade', 'Sensação persistente de ansiedade.', 'TPM e emoções', false, true),
  seed(9, 'insonia', 'Insônia', 'Dificuldade para iniciar ou manter o sono.', 'TPM e emoções', false, true),
  seed(10, 'inchaco', 'Inchaço', 'Sensação de inchaço corporal.', 'TPM e emoções', false, false),
  seed(11, 'dor-de-cabeca', 'Dor de cabeça', 'Dor de cabeça ou cefaleia.', 'TPM e emoções', false, true),
  seed(12, 'alteracao-de-humor', 'Alteração de humor', 'Oscilações emocionais.', 'TPM e emoções', false, true),
];

/** Where a symptom the API knows but the seed does not gets grouped. */
export const otherSymptomCategory = 'Outros';
