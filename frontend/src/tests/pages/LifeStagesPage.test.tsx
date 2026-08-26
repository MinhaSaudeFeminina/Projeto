import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import LifeStagesPage from "@/pages/LifeStagesPage";
import { listLifeStageTracks, updateLifeStageTrack, type LifeStageTrack } from "@/services/api/lifeStageApi";

vi.mock("@/services/api/lifeStageApi", () => ({
  listLifeStageTracks: vi.fn(),
  updateLifeStageTrack: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const adolescencia: LifeStageTrack = {
  id: 1,
  key: "adolescencia",
  name: "Adolescência",
  description: "Informações para jovens de 10 a 19 anos",
  ubs_orientation: "A UBS oferece atendimento especializado para adolescentes.",
  warning_signals: ["Menstruação muito irregular após 2 anos", "Cólicas incapacitantes"],
  reminder_suggestions: ["Vacina HPV"],
  sort_order: 10,
  is_active: true,
  contents_count: 3,
};

const senescencia: LifeStageTrack = {
  id: 2,
  key: "senescencia",
  name: "Senescência",
  description: "Saúde da mulher idosa",
  ubs_orientation: null,
  warning_signals: [],
  reminder_suggestions: [],
  sort_order: 60,
  is_active: false,
  contents_count: 0,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LifeStagesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listLifeStageTracks).mockResolvedValue([adolescencia, senescencia]);
});

test("lista as trilhas vindas da API com acentuação preservada", async () => {
  renderPage();

  expect(await screen.findByText("Adolescência")).toBeInTheDocument();
  expect(screen.getByText("Informações para jovens de 10 a 19 anos")).toBeInTheDocument();
  expect(screen.getByText("Vacina HPV")).toBeInTheDocument();
});

test("mostra a contagem real de conteúdos e de sinais de atenção", async () => {
  renderPage();

  expect(await screen.findByText("3 conteúdos vinculados")).toBeInTheDocument();
  expect(screen.getByText("2 sinais de atenção")).toBeInTheDocument();
  expect(screen.getByText("0 conteúdos vinculados")).toBeInTheDocument();
});

test("exibe trilhas inativas como rascunho", async () => {
  renderPage();

  await screen.findByText("Senescência");
  expect(screen.getByText("Publicado")).toBeInTheDocument();
  expect(screen.getByText("Rascunho")).toBeInTheDocument();
});

test("mostra a mensagem de erro quando a API falha", async () => {
  vi.mocked(listLifeStageTracks).mockRejectedValue(new Error("Não foi possível conectar à API."));
  renderPage();

  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar à API.");
});

test("abre o editor com os campos preenchidos", async () => {
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Editar Adolescência"));

  expect(screen.getByLabelText("Nome")).toHaveValue("Adolescência");
  expect(screen.getByLabelText("Orientação da UBS")).toHaveValue("A UBS oferece atendimento especializado para adolescentes.");
  expect(screen.getByText("Cólicas incapacitantes")).toBeInTheDocument();
});

test("salva a trilha com as listas editadas", async () => {
  vi.mocked(updateLifeStageTrack).mockResolvedValue(adolescencia);
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Editar Adolescência"));

  fireEvent.change(screen.getByLabelText("Sugestões de lembrete"), { target: { value: "Primeira consulta ginecológica" } });
  fireEvent.click(screen.getByLabelText("Adicionar em Sugestões de lembrete"));

  fireEvent.click(screen.getByLabelText("Remover Cólicas incapacitantes"));

  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(updateLifeStageTrack).toHaveBeenCalledWith(1, {
    name: "Adolescência",
    description: "Informações para jovens de 10 a 19 anos",
    ubs_orientation: "A UBS oferece atendimento especializado para adolescentes.",
    warning_signals: ["Menstruação muito irregular após 2 anos"],
    reminder_suggestions: ["Vacina HPV", "Primeira consulta ginecológica"],
    is_active: true,
  }));
});

test("envia nulo quando a orientação da UBS fica vazia", async () => {
  vi.mocked(updateLifeStageTrack).mockResolvedValue(adolescencia);
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Editar Adolescência"));
  fireEvent.change(screen.getByLabelText("Orientação da UBS"), { target: { value: "   " } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(updateLifeStageTrack).toHaveBeenCalledWith(1, expect.objectContaining({
    ubs_orientation: null,
  })));
});

test("publica uma trilha em rascunho pelo editor", async () => {
  vi.mocked(updateLifeStageTrack).mockResolvedValue({ ...senescencia, is_active: true });
  renderPage();
  await screen.findByText("Senescência");

  fireEvent.click(screen.getByLabelText("Editar Senescência"));
  fireEvent.click(screen.getByLabelText("Trilha publicada"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(updateLifeStageTrack).toHaveBeenCalledWith(2, expect.objectContaining({
    is_active: true,
  })));
});

test("não duplica um item já presente na lista", async () => {
  vi.mocked(updateLifeStageTrack).mockResolvedValue(adolescencia);
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Editar Adolescência"));
  fireEvent.change(screen.getByLabelText("Sugestões de lembrete"), { target: { value: "Vacina HPV" } });
  fireEvent.click(screen.getByLabelText("Adicionar em Sugestões de lembrete"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(updateLifeStageTrack).toHaveBeenCalledWith(1, expect.objectContaining({
    reminder_suggestions: ["Vacina HPV"],
  })));
});

test("visualiza a trilha completa em modo leitura", async () => {
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Visualizar Adolescência"));

  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText("Menstruação muito irregular após 2 anos")).toBeInTheDocument();
  expect(within(dialog).getByText("Cólicas incapacitantes")).toBeInTheDocument();
  expect(within(dialog).queryByLabelText("Nome")).not.toBeInTheDocument();
});
