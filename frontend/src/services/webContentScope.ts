type LifeStageReference = {
  key?: string;
  name?: string;
  label?: string;
};

type CategoryReference = {
  slug?: string;
  name?: string;
  description?: string | null;
};

const excludedLifeStageKeys = new Set(["gestacao", "puerperio"]);
const excludedLifeStageNames = new Set(["gestação", "puerpério"]);
const excludedCategorySlugs = new Set(["gravidez", "gestacao", "puerperio"]);
const excludedCategoryNames = new Set(["gravidez", "gestação", "puerpério"]);
const excludedTopicPattern = /(?:gravidez|gesta(?:c|ç)(?:a|ã)o|gestacional|gestante|puerp(?:e|é)rio|p(?:o|ó)s[- ]parto|pr(?:e|é)[- ]natal|engravidar|fertilidade|f(?:e|é)rtil|ovula(?:c|ç)(?:a|ã)o|concep(?:c|ç)(?:a|ã)o|parto|obst(?:e|é)tr(?:ico|ica)|feto|fetal|beb(?:e|ê)|matern(?:o|a|idade)|amamenta(?:c|ç)(?:a|ã)o|aleitamento|lacta(?:c|ç)(?:a|ã)o|embri(?:a|ã)o|ces(?:a|á)rea|rec(?:e|é)m[- ]nascid|nascimento)/iu;

function normalized(value?: string): string {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

export function isLifeStageAvailableOnWeb(stage: LifeStageReference): boolean {
  return !excludedLifeStageKeys.has(normalized(stage.key))
    && !excludedLifeStageNames.has(normalized(stage.name))
    && !excludedLifeStageNames.has(normalized(stage.label));
}

export function isCategoryAvailableOnWeb(category: CategoryReference): boolean {
  return !excludedCategorySlugs.has(normalized(category.slug))
    && !excludedCategoryNames.has(normalized(category.name))
    && isTextAvailableOnWeb(category.name, category.description);
}

export function isTextAvailableOnWeb(...values: Array<string | null | undefined>): boolean {
  return values.every((value) => !excludedTopicPattern.test(value ?? ""));
}
