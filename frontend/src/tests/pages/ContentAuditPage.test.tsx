import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ContentAuditPage from "@/pages/ContentAuditPage";
import { getAdminContent } from "@/services/api/contentApi";

vi.mock("@/services/api/contentApi", () => ({
  getAdminContent: vi.fn(),
}));

test("displays publication and archive metadata", async () => {
  vi.mocked(getAdminContent).mockResolvedValue({
    id: 10,
    title: "Saúde em todas as fases",
    slug: "saude-em-todas-as-fases",
    summary: "Conteúdo publicado.",
    body: "Orientações educativas.",
    status: "archived",
    category_id: 1,
    category: { id: 1, name: "Saúde" },
    life_stages: [],
    age_ranges: [],
    author_id: 1,
    author: { id: 1, name: "Autora" },
    submitted_by: 1,
    submitted_at: "2026-08-24T10:00:00.000Z",
    reviewed_by: 2,
    reviewed_at: "2026-08-24T11:00:00.000Z",
    approved_by: 2,
    approved_at: "2026-08-24T12:00:00.000Z",
    published_by: 3,
    published_at: "2026-08-24T13:00:00.000Z",
    archived_by: 3,
    archived_at: "2026-08-24T14:00:00.000Z",
    updated_at: "2026-08-24T14:00:00.000Z",
  });

  render(
    <MemoryRouter initialEntries={["/conteudos/10/auditoria"]}>
      <Routes>
        <Route path="/conteudos/:id/auditoria" element={<ContentAuditPage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByText("Metadados de publicação")).toBeInTheDocument();
  expect(screen.getByText("Publicação")).toBeInTheDocument();
  expect(screen.getByText("Arquivamento")).toBeInTheDocument();
  expect(screen.getAllByText("Responsável: usuário #3")).toHaveLength(2);
});
