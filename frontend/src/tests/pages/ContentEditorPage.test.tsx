import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ContentEditorPage from "@/pages/ContentEditorPage";
import { createDraftContent } from "@/services/api/contentApi";

vi.mock("@/services/api/contentApi", () => ({
  createDraftContent: vi.fn().mockResolvedValue({ id: 1 }),
  getAdminContent: vi.fn(),
  updateDraftContent: vi.fn(),
}));

vi.mock("@/services/api/taxonomyApi", () => ({
  listTaxonomies: vi.fn().mockResolvedValue({
    categories: [{ id: 1, name: "Saúde íntima" }],
    life_stages: [{ id: 2, name: "Vida adulta" }],
    age_ranges: [{ id: 3, label: "20-29" }],
  }),
}));

test("creates a draft with category, life stage and age range", async () => {
  render(<MemoryRouter><ContentEditorPage /></MemoryRouter>);

  await screen.findByText("Saúde íntima");
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Saúde e prevenção" } });
  fireEvent.change(screen.getByLabelText("Resumo"), { target: { value: "Orientações em português." } });
  fireEvent.change(screen.getByLabelText("Conteúdo educativo"), { target: { value: "Texto educativo completo." } });
  fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "1" } });
  fireEvent.click(screen.getByLabelText("Vida adulta"));
  fireEvent.click(screen.getByLabelText("20-29"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

  await waitFor(() => expect(createDraftContent).toHaveBeenCalledWith({
    title: "Saúde e prevenção",
    summary: "Orientações em português.",
    body: "Texto educativo completo.",
    category_id: 1,
    life_stage_ids: [2],
    age_range_ids: [3],
  }));
});
