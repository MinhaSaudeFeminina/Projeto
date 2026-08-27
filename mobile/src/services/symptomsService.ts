import { listSymptomCatalog } from '../api/symptomsApi';
import { fail, ok, type ApiResult } from '../api/types';
import { databaseFailure } from './access';
import { getDatabase } from '../db/database';
import {
  insertMissingRemoteSymptoms,
  insertUserSymptom,
  listCatalog,
  type SymptomCatalogRow,
} from '../db/symptomCatalogRepository';
import { otherSymptomCategory } from '../data/symptomCatalogSeed';
import { isBlank, slugify } from '../utils/text';
import type { SymptomIntensity } from '../utils/period';

export type SymptomOption = {
  key: string;
  name: string;
  category: string;
  shortDescription: string | null;
  askIntensity: boolean;
  isAlertCandidate: boolean;
  severityAlertText: string | null;
  isCustom: boolean;
};

export type SymptomGroup = {
  category: string;
  symptoms: SymptomOption[];
};

export async function getSymptomCatalog(): Promise<ApiResult<SymptomOption[]>> {
  try {
    const db = await getDatabase();
    const rows = await listCatalog(db);

    // Fire and forget: the seeded catalog is already on screen, and a slow or
    // absent network must never delay logging a symptom.
    void refreshCatalog();

    return ok(rows.map(toOption));
  } catch (error) {
    return databaseFailure(error);
  }
}

export function groupSymptoms(symptoms: SymptomOption[]): SymptomGroup[] {
  const groups: SymptomGroup[] = [];

  for (const symptom of symptoms) {
    const group = groups.find((item) => item.category === symptom.category);

    if (group) {
      group.symptoms.push(symptom);
    } else {
      groups.push({ category: symptom.category, symptoms: [symptom] });
    }
  }

  return groups;
}

export async function addCustomSymptom(
  name: string,
): Promise<ApiResult<SymptomOption>> {
  if (isBlank(name)) {
    return fail('EMPTY_SYMPTOM_NAME', 'Escreva o nome do sintoma.');
  }

  const key = `custom:${slugify(name)}`;

  if (key === 'custom:') {
    return fail('INVALID_SYMPTOM_NAME', 'Escreva o nome do sintoma com letras.');
  }

  try {
    const db = await getDatabase();

    await insertUserSymptom(db, {
      category: 'Meus sintomas',
      key,
      name: name.trim(),
    });

    const rows = await listCatalog(db);
    const created = rows.find((row) => row.key === key);

    return created
      ? ok(toOption(created))
      : fail('SYMPTOM_NOT_SAVED', 'Nao foi possivel salvar esse sintoma.');
  } catch (error) {
    return databaseFailure(error);
  }
}

/**
 * The admin catalog can grow, so new names are pulled in. Only inserts:
 * `GET /symptoms` returns just id, name, description and is_alert_candidate,
 * none of the category, intensity, ordering or guidance fields this catalog
 * holds, so updating from it would blank the seeded copy.
 */
async function refreshCatalog() {
  const result = await listSymptomCatalog();

  if (!result.ok) {
    return;
  }

  try {
    const db = await getDatabase();

    await insertMissingRemoteSymptoms(
      db,
      result.data.map((symptom) => ({
        description: symptom.description,
        isAlertCandidate: symptom.is_alert_candidate,
        key: slugify(symptom.name),
        name: symptom.name,
      })),
      otherSymptomCategory,
    );
  } catch {
    // A catalog that could not be refreshed is still the seeded one.
  }
}

/**
 * The rule the backend applies in `HealthAlertGuidanceService`, moved to the
 * device along with the records. The message is the symptom's own text rather
 * than one generic string, which is strictly more useful.
 */
export function getSymptomGuidance(
  symptom: SymptomOption,
  intensity: SymptomIntensity | null,
) {
  const shouldWarn = symptom.isAlertCandidate || intensity === 'intenso';

  return shouldWarn ? symptom.severityAlertText : null;
}

function toOption(row: SymptomCatalogRow): SymptomOption {
  return {
    askIntensity: row.ask_intensity === 1,
    category: row.category ?? otherSymptomCategory,
    isAlertCandidate: row.is_alert_candidate === 1,
    isCustom: row.source === 'user',
    key: row.key,
    name: row.name,
    severityAlertText: row.severity_alert_text,
    shortDescription: row.short_description,
  };
}
