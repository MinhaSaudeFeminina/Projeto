import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import SupportPage from "@/pages/SupportPage";
import {
  createSupportContact,
  deleteSupportContact,
  listSupportContacts,
  updateSupportContact,
} from "@/services/api/supportContactApi";

vi.mock("@/services/api/supportContactApi", () => ({
  createSupportContact: vi.fn(),
  deleteSupportContact: vi.fn(),
  listSupportContacts: vi.fn(),
  updateSupportContact: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const contacts = [
  {
    id: 1,
    name: "Central de Atendimento à Mulher",
    description: "Ligue 180 para orientações.",
    type: "emergencia",
    phone: "180",
    link: null,
    cta_label: "Ligar agora",
    sort_order: 10,
    is_highlighted: true,
    is_active: true,
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listSupportContacts).mockResolvedValue(contacts);
  vi.mocked(createSupportContact).mockResolvedValue(contacts[0]);
  vi.mocked(updateSupportContact).mockResolvedValue(contacts[0]);
  vi.mocked(deleteSupportContact).mockResolvedValue();
});

test("lista contatos de apoio vindos da API", async () => {
  renderPage();

  expect(await screen.findByText("Central de Atendimento à Mulher")).toBeInTheDocument();
  expect(screen.getByText("Ligue 180 para orientações.")).toBeInTheDocument();
  expect(screen.getByText("180")).toBeInTheDocument();
});

test("envia edição de contato para a API", async () => {
  renderPage();

  fireEvent.click(await screen.findByRole("button", { name: "Editar Central de Atendimento à Mulher" }));
  fireEvent.change(screen.getByLabelText("Descrição"), {
    target: { value: "Atendimento nacional para mulheres." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(updateSupportContact).toHaveBeenCalledWith(1, {
    name: "Central de Atendimento à Mulher",
    description: "Atendimento nacional para mulheres.",
    type: "emergencia",
    phone: "180",
    link: null,
    cta_label: "Ligar agora",
    sort_order: 10,
    is_highlighted: true,
    is_active: true,
  }));
});
