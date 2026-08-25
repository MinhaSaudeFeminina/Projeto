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
  window.localStorage.clear();
  vi.mocked(listAdminContents).mockResolvedValue([]);
  vi.mocked(listTaxonomies).mockResolvedValue({ categories: [], life_stages: [], age_ranges: [] });
});

afterEach(cleanup);

function expectInteractiveElementsToHaveNames(container: HTMLElement) {
  const elements = container.querySelectorAll("button, input, select, textarea, a[href]");

  expect(elements.length).toBeGreaterThan(0);
  elements.forEach((element) => expect(element).toHaveAccessibleName());
}

test("administrative login exposes labels, heading and named controls", () => {
  const { container } = render(<MemoryRouter><AdminLoginPage /></MemoryRouter>);

  expect(screen.getByRole("heading", { name: "Bem-vinda de volta" })).toBeInTheDocument();
  expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "email");
  expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "current-password");
  expect(screen.getByAltText("Padrão floral Minha Saúde Feminina")).toBeInTheDocument();
  expectInteractiveElementsToHaveNames(container);
});

test("content management exposes named search filters and actions", async () => {
  const { container } = render(<MemoryRouter><ContentListPage /></MemoryRouter>);

  expect(screen.getByRole("heading", { name: "Conteúdos educativos" })).toBeInTheDocument();
  expect(await screen.findByText("Nenhum conteúdo encontrado.")).toBeInTheDocument();
  expect(screen.getByLabelText("Buscar conteúdos")).toBeInTheDocument();
  expect(screen.getByLabelText("Estado editorial")).toBeInTheDocument();
  expectInteractiveElementsToHaveNames(container);
});
