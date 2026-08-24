import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ContentEditorPage from "@/pages/ContentEditorPage";
import { createDraftContent, getAdminContent } from "@/services/api/contentApi";
import { approveContent } from "@/services/api/editorialApi";

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

vi.mock("@/services/api/editorialApi", () => ({
  approveContent: vi.fn().mockResolvedValue({ id: 7, status: "approved" }),
  requestContentAdjustments: vi.fn(),
  submitContentForReview: vi.fn(),
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

test("allows a reviewer to approve content from the detail page", async () => {
  window.localStorage.setItem("msf_admin_token", "token");
  window.localStorage.setItem("msf_admin_user", JSON.stringify({
    id: 3,
    name: "Professora Revisora",
    email: "revisora@example.com",
    roles: ["reviewer_professor"],
  }));
  vi.mocked(getAdminContent).mockResolvedValue({
    id: 7,
    title: "Saúde no climatério",
    slug: "saude-no-climaterio",
    summary: "Orientações educativas.",
    body: "Conteúdo em revisão.",
    status: "in_review",
    category_id: 1,
    category: { id: 1, name: "Saúde íntima" },
    life_stages: [],
    age_ranges: [],
    updated_at: "2026-08-24T00:00:00Z",
  });

  render(
    <MemoryRouter initialEntries={["/conteudos/7"]}>
      <Routes><Route path="/conteudos/:id" element={<ContentEditorPage />} /></Routes>
    </MemoryRouter>,
  );

  fireEvent.click(await screen.findByRole("button", { name: "Registrar revisão" }));
  fireEvent.click(screen.getByRole("button", { name: "Aprovar conteúdo" }));

  await waitFor(() => expect(approveContent).toHaveBeenCalledWith(7, undefined));
  window.localStorage.clear();
});
