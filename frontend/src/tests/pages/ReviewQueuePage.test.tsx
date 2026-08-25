import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ReviewQueuePage from "@/pages/ReviewQueuePage";
import { requestContentAdjustments } from "@/services/api/editorialApi";

vi.mock("@/services/api/contentApi", () => ({
  listAdminContents: vi.fn().mockResolvedValue([{
    id: 10,
    title: "Saúde íntima e prevenção",
    summary: "Orientações educativas.",
    status: "in_review",
    category: { id: 1, name: "Saúde íntima" },
    author: { id: 2, name: "Acadêmica Ana" },
  }]),
}));

vi.mock("@/services/api/editorialApi", () => ({
  approveContent: vi.fn(),
  requestContentAdjustments: vi.fn().mockResolvedValue({ status: "draft" }),
}));

test("lists review content and requires a comment for adjustments", async () => {
  render(<MemoryRouter><ReviewQueuePage /></MemoryRouter>);

  expect(await screen.findByText("Saúde íntima e prevenção")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Revisar conteúdo" }));
  fireEvent.click(screen.getByRole("button", { name: "Solicitar ajustes" }));
  expect(screen.getByText("Informe o comentário com os ajustes necessários.")).toBeInTheDocument();
  expect(requestContentAdjustments).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText("Comentário editorial"), {
    target: { value: "Revisar acentuação e orientação profissional." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Solicitar ajustes" }));

  await waitFor(() => expect(requestContentAdjustments).toHaveBeenCalledWith(
    10,
    "Revisar acentuação e orientação profissional.",
  ));
  expect(await screen.findByText("Nenhum conteúdo aguardando revisão.")).toBeInTheDocument();
});
