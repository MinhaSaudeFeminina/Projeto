import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ContentListPage from "@/pages/ContentListPage";

vi.mock("@/services/api/contentApi", () => ({
  listAdminContents: vi.fn().mockResolvedValue([]),
}));

test("renders content management page in Portuguese", async () => {
  render(<MemoryRouter><ContentListPage /></MemoryRouter>);

  expect(screen.getByText("Conteúdos educativos")).toBeInTheDocument();
  expect(await screen.findByText("Nenhum conteúdo encontrado.")).toBeInTheDocument();
});
