import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import ContentListPage from "@/pages/ContentListPage";
import { listAdminContents, type AdminContent } from "@/services/api/contentApi";
import { listTaxonomies } from "@/services/api/taxonomyApi";

vi.mock("@/services/api/contentApi", () => ({
  listAdminContents: vi.fn(),
}));

vi.mock("@/services/api/taxonomyApi", () => ({
  listTaxonomies: vi.fn(),
}));

vi.mock("@/services/api/editorialApi", () => ({
  archiveContent: vi.fn(),
  publishContent: vi.fn(),
}));

const content = {
  id: 10,
  title: "Menstruação, saúde íntima e prevenção",
  slug: "menstruacao-saude-intima-prevencao",
  summary: "Orientações para o climatério.",
  body: "Conteúdo educativo.",
  status: "draft",
  category_id: 1,
  category: { id: 1, name: "Saúde íntima" },
  life_stages: [{ id: 2, name: "Climatério/menopausa" }],
  age_ranges: [{ id: 3, label: "40-49" }],
  author_id: 7,
  author: { id: 7, name: "Autora" },
  submitted_by: null,
  submitted_at: null,
  reviewed_by: null,
  reviewed_at: null,
  approved_by: null,
  approved_at: null,
  published_by: null,
  published_at: null,
  archived_by: null,
  archived_at: null,
  updated_at: "2026-08-24T12:00:00.000Z",
} satisfies AdminContent;

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  vi.mocked(listAdminContents).mockResolvedValue([content]);
  vi.mocked(listTaxonomies).mockResolvedValue({
    categories: [{ id: 1, name: "Saúde íntima" }],
    life_stages: [{ id: 2, name: "Climatério/menopausa" }],
    age_ranges: [{ id: 3, label: "40-49" }],
  });
});

test('busca sem acentos e envia todos os filtros administrativos', async () => {
  render(<MemoryRouter><ContentListPage /></MemoryRouter>);

  expect(await screen.findByText("Menstruação, saúde íntima e prevenção")).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("Buscar conteúdos"), { target: { value: "menstruacao" } });
  fireEvent.change(screen.getByLabelText("Estado editorial"), { target: { value: "draft" } });
  fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("Fase da vida"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("Faixa etária"), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText("ID da autoria"), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

  await waitFor(() => expect(listAdminContents).toHaveBeenLastCalledWith({
    q: "menstruacao",
    status: "draft",
    categoryId: 1,
    lifeStageId: 2,
    ageRangeId: 3,
    authorId: 7,
  }));
  expect(screen.getByText("Menstruação, saúde íntima e prevenção")).toBeInTheDocument();
});

