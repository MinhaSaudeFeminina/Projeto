import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, vi } from "vitest";
import AdminLoginPage from "@/pages/AdminLoginPage";
import ContentListPage from "@/pages/ContentListPage";
import { listAdminContents } from "@/services/api/contentApi";
import { listTaxonomies } from "@/services/api/taxonomyApi";

vi.mock("@/services/api/contentApi", () => ({
  listAdminContents: vi.fn(),
}));

vi.mock("@/services/api/editorialApi", () => ({
  archiveContent: vi.fn(),
  publishContent: vi.fn(),
}));

vi.mock("@/services/api/taxonomyApi", () => ({
  listTaxonomies: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(listAdminContents).mockResolvedValue([]);
  vi.mocked(listTaxonomies).mockResolvedValue({
    categories: [{ id: 1, name: "Saúde íntima" }],
    life_stages: [{ id: 2, name: "Adolescência" }, { id: 3, name: "Climatério/menopausa" }],
    age_ranges: [{ id: 4, label: "50+" }],
  });
});

afterEach(cleanup);

function expectValidUtf8Text(container: HTMLElement) {
  expect(container.textContent).not.toMatch(/Ã.|Â.|�/u);
}

test("global administrative surfaces preserve Portuguese accents", async () => {
  const login = render(<MemoryRouter><AdminLoginPage /></MemoryRouter>);

  expect(screen.getByText(/gestão editorial, revisão e publicação de conteúdos educativos/i)).toBeInTheDocument();
  expectValidUtf8Text(login.container);
  cleanup();

  const contents = render(<MemoryRouter><ContentListPage /></MemoryRouter>);

  expect(screen.getByRole("heading", { name: "Conteúdos educativos" })).toBeInTheDocument();
  expect(await screen.findByRole("option", { name: "Saúde íntima" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Adolescência" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Climatério/menopausa" })).toBeInTheDocument();
  expect(screen.getByText("A busca encontra palavras com ou sem acentos.")).toBeInTheDocument();
  expectValidUtf8Text(contents.container);
});
