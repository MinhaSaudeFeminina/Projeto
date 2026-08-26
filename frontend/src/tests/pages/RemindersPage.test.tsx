import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import RemindersPage from "@/pages/RemindersPage";
import {
  createReminder,
  duplicateReminder,
  listReminders,
  updateReminder,
  type Reminder,
} from "@/services/api/reminderApi";

vi.mock("@/services/api/reminderApi", () => ({
  createReminder: vi.fn(),
  duplicateReminder: vi.fn(),
  listReminders: vi.fn(),
  updateReminder: vi.fn(),
  deleteReminder: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const preventivo: Reminder = {
  id: 1,
  title: "Exame preventivo (Papanicolau)",
  description: "Lembrete para realização do exame preventivo.",
  type: "exame_preventivo",
  priority: "alta",
  audience: "Mulheres 25-64 anos",
  periodicity: "Anual",
  start_date: "2026-01-01",
  end_date: null,
  short_message: "Está na hora do seu preventivo!",
  expanded_message: "Procure a UBS para agendar.",
  is_active: true,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RemindersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listReminders).mockResolvedValue([preventivo]);
});

test("lista os lembretes vindos da API com acentuação preservada", async () => {
  renderPage();

  expect(await screen.findByText("Exame preventivo (Papanicolau)")).toBeInTheDocument();
  expect(screen.getByText("Está na hora do seu preventivo!")).toBeInTheDocument();
  expect(screen.getByText("Mulheres 25-64 anos")).toBeInTheDocument();
  expect(screen.getByText("Anual")).toBeInTheDocument();
});

test("mostra aviso quando não há lembretes", async () => {
  vi.mocked(listReminders).mockResolvedValue([]);
  renderPage();

  expect(await screen.findByText("Nenhum lembrete encontrado.")).toBeInTheDocument();
});

test("mostra a mensagem de erro quando a API falha", async () => {
  vi.mocked(listReminders).mockRejectedValue(new Error("Não foi possível conectar à API."));
  renderPage();

  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar à API.");
});

test("cria um lembrete com o payload esperado pela API", async () => {
  vi.mocked(createReminder).mockResolvedValue(preventivo);
  renderPage();
  await screen.findByText("Exame preventivo (Papanicolau)");

  fireEvent.click(screen.getByRole("button", { name: /Novo lembrete/ }));

  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Outubro Rosa" } });
  fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Campanha de conscientização." } });
  fireEvent.change(screen.getByLabelText("Público-alvo"), { target: { value: "Todas as usuárias" } });
  fireEvent.change(screen.getByLabelText("Periodicidade"), { target: { value: "Anual" } });
  fireEvent.change(screen.getByLabelText("Mensagem curta"), { target: { value: "Outubro Rosa: cuide-se!" } });
  fireEvent.change(screen.getByLabelText("Mensagem expandida"), { target: { value: "Faça seus exames." } });
  fireEvent.change(screen.getByLabelText("Data inicial"), { target: { value: "2026-10-01" } });
  fireEvent.change(screen.getByLabelText("Data final"), { target: { value: "2026-10-31" } });

  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(createReminder).toHaveBeenCalledWith({
    title: "Outubro Rosa",
    description: "Campanha de conscientização.",
    type: "exame_preventivo",
    priority: "media",
    audience: "Todas as usuárias",
    periodicity: "Anual",
    start_date: "2026-10-01",
    end_date: "2026-10-31",
    short_message: "Outubro Rosa: cuide-se!",
    expanded_message: "Faça seus exames.",
    is_active: true,
  }));
});

test("envia data final nula quando o campo fica vazio", async () => {
  vi.mocked(createReminder).mockResolvedValue(preventivo);
  renderPage();
  await screen.findByText("Exame preventivo (Papanicolau)");

  fireEvent.click(screen.getByRole("button", { name: /Novo lembrete/ }));
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Autoexame" } });
  fireEvent.change(screen.getByLabelText("Público-alvo"), { target: { value: "Todas" } });
  fireEvent.change(screen.getByLabelText("Periodicidade"), { target: { value: "Mensal" } });
  fireEvent.change(screen.getByLabelText("Mensagem curta"), { target: { value: "Hora do autoexame!" } });
  fireEvent.change(screen.getByLabelText("Mensagem expandida"), { target: { value: "Observe suas mamas." } });
  fireEvent.change(screen.getByLabelText("Data inicial"), { target: { value: "2026-01-01" } });

  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(createReminder).toHaveBeenCalledWith(
    expect.objectContaining({ end_date: null, description: null }),
  ));
});

test("edita um lembrete existente com os campos preenchidos", async () => {
  vi.mocked(updateReminder).mockResolvedValue({ ...preventivo, title: "Exame preventivo anual" });
  renderPage();
  await screen.findByText("Exame preventivo (Papanicolau)");

  fireEvent.click(screen.getByLabelText("Editar Exame preventivo (Papanicolau)"));

  expect(screen.getByLabelText("Título")).toHaveValue("Exame preventivo (Papanicolau)");
  expect(screen.getByLabelText("Periodicidade")).toHaveValue("Anual");

  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Exame preventivo anual" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(updateReminder).toHaveBeenCalledWith(1, expect.objectContaining({
    title: "Exame preventivo anual",
  })));
});

test("alterna a situação do lembrete pelo switch da tabela", async () => {
  vi.mocked(updateReminder).mockResolvedValue({ ...preventivo, is_active: false });
  renderPage();
  await screen.findByText("Exame preventivo (Papanicolau)");

  fireEvent.click(screen.getByLabelText("Ativar Exame preventivo (Papanicolau)"));

  await waitFor(() => expect(updateReminder).toHaveBeenCalledWith(1, { is_active: false }));
});

test("duplica um lembrete pela ação da tabela", async () => {
  vi.mocked(duplicateReminder).mockResolvedValue({ ...preventivo, id: 2, is_active: false });
  renderPage();
  await screen.findByText("Exame preventivo (Papanicolau)");

  fireEvent.click(screen.getByLabelText("Duplicar Exame preventivo (Papanicolau)"));

  await waitFor(() => expect(duplicateReminder).toHaveBeenCalledWith(1));
});

test("filtra no servidor ao buscar por texto", async () => {
  vi.useFakeTimers();
  renderPage();

  fireEvent.change(screen.getByLabelText("Buscar lembretes"), { target: { value: "mamografia" } });
  await vi.advanceTimersByTimeAsync(400);
  vi.useRealTimers();

  await waitFor(() => expect(listReminders).toHaveBeenCalledWith(
    expect.objectContaining({ q: "mamografia" }),
  ));
});
