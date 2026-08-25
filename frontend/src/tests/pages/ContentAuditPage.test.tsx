import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ContentAuditPage from "@/pages/ContentAuditPage";
import { getAdminContent } from "@/services/api/contentApi";
import { getContentAudit, getContentRevisions } from "@/services/api/auditApi";

vi.mock("@/services/api/contentApi", () => ({
  getAdminContent: vi.fn(),
}));

vi.mock("@/services/api/auditApi", () => ({
  getContentAudit: vi.fn(),
  getContentRevisions: vi.fn(),
}));

test("displays publication metadata, audit timeline and revision history", async () => {
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
  vi.mocked(getContentAudit).mockResolvedValue([
    {
      id: 2,
      actor_id: 3,
      actor: { id: 3, name: "Administradora" },
      action: "published",
      previous_status: "approved",
      new_status: "published",
      comment: null,
      occurred_at: "2026-08-24T13:00:00.000Z",
    },
    {
      id: 1,
      actor_id: 2,
      actor: { id: 2, name: "Revisora" },
      action: "adjustments_requested",
      previous_status: "in_review",
      new_status: "draft",
      comment: "Incluir orientação profissional.",
      occurred_at: "2026-08-24T11:00:00.000Z",
    },
  ]);
  vi.mocked(getContentRevisions).mockResolvedValue([
    {
      id: 2,
      content_id: 10,
      changed_by: 3,
      changed_by_user: { id: 3, name: "Administradora" },
      version: 2,
      title_snapshot: "Saúde em todas as fases",
      summary_snapshot: "Conteúdo publicado.",
      body_snapshot: "Orientações educativas.",
      status_snapshot: "published",
      change_summary: "Conteúdo publicado",
      created_at: "2026-08-24T13:00:00.000Z",
    },
  ]);

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
  expect(screen.getByRole("heading", { name: "Linha do tempo editorial" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Conteúdo publicado" })).toBeInTheDocument();
  expect(screen.getByText("Comentário: Incluir orientação profissional.")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Histórico de versões" })).toBeInTheDocument();
  expect(screen.getByText("Versão 2: Saúde em todas as fases")).toBeInTheDocument();
});
