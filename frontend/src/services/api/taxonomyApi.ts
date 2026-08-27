import { apiRequest } from "@/services/api/client";
import { isCategoryAvailableOnWeb, isLifeStageAvailableOnWeb } from "@/services/webContentScope";
import { getAdminToken } from "@/state/adminAuthStore";

export type ContentCategory = { id: number; name: string; slug?: string; description?: string | null };
export type LifeStage = { id: number; key?: string; name: string };
export type AgeRange = { id: number; label: string; min_age?: number; max_age?: number | null };

export type ContentTaxonomies = {
  categories: ContentCategory[];
  life_stages: LifeStage[];
  age_ranges: AgeRange[];
};

export async function listTaxonomies(): Promise<ContentTaxonomies> {
  const response = await apiRequest<{ data: ContentTaxonomies }>(
    "/admin/taxonomies",
    {},
    { token: getAdminToken() },
  );

  return {
    ...response.data,
    categories: response.data.categories.filter(isCategoryAvailableOnWeb),
    life_stages: response.data.life_stages.filter(isLifeStageAvailableOnWeb),
  };
}
