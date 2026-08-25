import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import ContentListPage from "@/pages/ContentListPage";
import { listAdminContents, type AdminContent } from "@/services/api/contentApi";
import { archiveContent, publishContent } from "@/services/api/editorialApi";

vi.mock("@/services/api/contentApi", () => ({
  listAdminContents: vi.fn(),
}));

vi.mock("@/services/api/editorialApi", () => ({
  archiveContent: vi.fn(),
  publishContent: vi.fn(),
}));

const approvedContent = {
  id: 10,
  title: "Saúde em todas as fases",
  slug: "saude-em-todas-as-fases",
  summary: "Conteúdo aprovado.",
  body: "Orientações educativas.",
  status: "approved",
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
  published_by: null,
  published_at: null,
  archived_by: null,
  archived_at: null,
  updated_at: "2026-08-24T12:00:00.000Z",
} satisfies AdminContent;

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(listAdminContents).mockResolvedValue([]);
});

test("renders content management page in Portuguese", async () => {
  render(<MemoryRouter><ContentListPage /></MemoryRouter>);

  expect(screen.getByText("Conteúdos educativos")).toBeInTheDocument();
  expect(await screen.findByText("Nenhum conteúdo encontrado.")).toBeInTheDocument();
});

test("allows an Admin to publish and then archive approved content", async () => {
  window.localStorage.setItem("msf_admin_token", "token");
  window.localStorage.setItem("msf_admin_user", JSON.stringify({
    id: 3,
    name: "Administradora",
    email: "admin@example.com",
    roles: ["admin"],
  }));
  vi.mocked(listAdminContents).mockResolvedValue([approvedContent]);
  vi.mocked(publishContent).mockResolvedValue({
    ...approvedContent,
    status: "published",
    published_by: 3,
    published_at: "2026-08-24T13:00:00.000Z",
  });
  vi.mocked(archiveContent).mockResolvedValue({
    ...approvedContent,
    status: "archived",
    published_by: 3,
    published_at: "2026-08-24T13:00:00.000Z",
    archived_by: 3,
    archived_at: "2026-08-24T14:00:00.000Z",
  });

  render(<MemoryRouter><ContentListPage /></MemoryRouter>);

  fireEvent.click(await screen.findByRole("button", { name: "Publicar" }));
  await waitFor(() => expect(publishContent).toHaveBeenCalledWith(10));

  fireEvent.click(await screen.findByRole("button", { name: "Arquivar" }));
  await waitFor(() => expect(archiveContent).toHaveBeenCalledWith(10));
  expect(await screen.findByLabelText("Estado editorial: Arquivado")).toBeInTheDocument();
});
