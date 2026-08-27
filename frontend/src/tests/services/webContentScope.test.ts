import { describe, expect, it } from "vitest";
import {
  isCategoryAvailableOnWeb,
  isLifeStageAvailableOnWeb,
  isTextAvailableOnWeb,
} from "@/services/webContentScope";

describe("web content scope", () => {
  it("keeps unrelated categories and life stages available", () => {
    expect(isCategoryAvailableOnWeb({ slug: "saude-intima", name: "Saúde íntima" })).toBe(true);
    expect(isLifeStageAvailableOnWeb({ key: "vida_adulta", name: "Vida adulta" })).toBe(true);
  });

  it("excludes removed topics from categories, life stages, and content text", () => {
    expect(isCategoryAvailableOnWeb({ slug: "gravidez", name: "Gravidez" })).toBe(false);
    expect(isLifeStageAvailableOnWeb({ key: "gestacao", name: "Gestação" })).toBe(false);
    expect(isLifeStageAvailableOnWeb({ key: "puerperio", name: "Puerpério" })).toBe(false);
    expect(isTextAvailableOnWeb("Cuidados no pré-natal")).toBe(false);
    expect(isTextAvailableOnWeb("Orientações sobre fertilidade e ovulação")).toBe(false);
    expect(isTextAvailableOnWeb("Cuidados com o bebê")).toBe(false);
    expect(isTextAvailableOnWeb("Saúde íntima e prevenção")).toBe(true);
  });
});
