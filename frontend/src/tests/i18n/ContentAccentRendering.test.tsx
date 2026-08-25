import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ContentEditorPage from "@/pages/ContentEditorPage";

vi.mock("@/services/api/contentApi", () => ({
  createDraftContent: vi.fn(),
  getAdminContent: vi.fn(),
  updateDraftContent: vi.fn(),
}));

vi.mock("@/services/api/taxonomyApi", () => ({
  listTaxonomies: vi.fn().mockResolvedValue({
    categories: [{ id: 1, name: "Saúde íntima" }],
    life_stages: [{ id: 2, name: "Climatério/menopausa" }],
    age_ranges: [{ id: 3, label: "50+" }],
  }),
}));

test("preserves Portuguese accents in the content editor", async () => {
  render(<MemoryRouter><ContentEditorPage /></MemoryRouter>);

  expect(screen.getByRole("heading", { name: "Novo conteúdo educativo" })).toBeInTheDocument();
  expect(screen.getByText("Revise a ortografia e a acentuação antes de salvar.")).toBeInTheDocument();
  expect(await screen.findByText("Saúde íntima")).toBeInTheDocument();
  expect(screen.getByText("Climatério/menopausa")).toBeInTheDocument();
});
