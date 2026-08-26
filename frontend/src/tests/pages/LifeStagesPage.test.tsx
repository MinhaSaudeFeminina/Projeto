import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import LifeStagesPage from "@/pages/LifeStagesPage";
import { listAdminContents, type AdminContent } from "@/services/api/contentApi";
import {
  archiveLifeStageTrack,
  createLifeStageTrack,
  deleteLifeStageTrack,
  getLifeStageTrack,
  listLifeStageTracks,
  publishLifeStageTrack,
  syncLifeStageTrackContents,
  updateLifeStageTrack,
  type LifeStageTrack,
} from "@/services/api/lifeStageApi";
import { listTaxonomies } from "@/services/api/taxonomyApi";

vi.mock("@/services/api/lifeStageApi", () => ({
  listLifeStageTracks: vi.fn(),
  getLifeStageTrack: vi.fn(),
  createLifeStageTrack: vi.fn(),
  updateLifeStageTrack: vi.fn(),
  deleteLifeStageTrack: vi.fn(),
  syncLifeStageTrackContents: vi.fn(),
  publishLifeStageTrack: vi.fn(),
  archiveLifeStageTrack: vi.fn(),
}));

vi.mock("@/services/api/taxonomyApi", () => ({
  listTaxonomies: vi.fn(),
}));

vi.mock("@/services/api/contentApi", () => ({
  listAdminContents: vi.fn(),
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
  age_range_id: 10,
  age_range: { id: 10, label: "10-14" },
  status: "published",
  published_at: "2026-08-01T12:00:00Z",
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
  age_range_id: 20,
  age_range: { id: 20, label: "50+" },
  status: "draft",
  published_at: null,
  sort_order: 60,
  is_active: false,
  contents_count: 0,
};

function trackContent(overrides: Partial<AdminContent> = {}): AdminContent {
  return {
    id: 101,
    title: "Cólica menstrual",
    slug: "colica-menstrual",
    summary: "Orientações educativas.",
    body: "<p>Conteúdo</p>",
    status: "published",
    category_id: 1,
    category: { id: 1, name: "Saúde íntima" },
    life_stages: [],
    age_ranges: [],
    author_id: 1,
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
    updated_at: "2026-08-01T12:00:00Z",
    ...overrides,
  };
}

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

/** A tela esconde ações por perfil, então o teste precisa de uma sessão. */
function signInAs(roles: string[]) {
  window.localStorage.setItem("msf_admin_token", "token-de-teste");
  window.localStorage.setItem(
    "msf_admin_user",
    JSON.stringify({ id: 1, name: "Admin", email: "admin@example.com", roles }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  signInAs(["admin"]);
  vi.mocked(listLifeStageTracks).mockResolvedValue([adolescencia, senescencia]);
  vi.mocked(listTaxonomies).mockResolvedValue({
    categories: [],
    life_stages: [],
    age_ranges: [
      { id: 10, label: "10-14" },
      { id: 20, label: "50+" },
    ],
  });
  vi.mocked(listAdminContents).mockResolvedValue([]);
  vi.mocked(getLifeStageTrack).mockResolvedValue(adolescencia);
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

test("mostra a faixa etária de cada trilha", async () => {
  renderPage();

  expect(await screen.findByText("Faixa etária 10-14")).toBeInTheDocument();
  expect(screen.getByText("Faixa etária 50+")).toBeInTheDocument();
});

test("distingue a trilha publicada da que ainda está em rascunho", async () => {
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
    age_range_id: 10,
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

test("cria a trilha em rascunho, nunca publicada de largada", async () => {
  vi.mocked(createLifeStageTrack).mockResolvedValue(senescencia);
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByRole("button", { name: /Nova trilha/ }));
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Primeira menstruação" } });
  fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "O que esperar da menarca." } });

  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText(/só aparece no aplicativo depois de publicada/i)).toBeInTheDocument();
});

test("publica a trilha pela ação dedicada", async () => {
  vi.mocked(publishLifeStageTrack).mockResolvedValue({ ...senescencia, status: "published" });
  renderPage();
  await screen.findByText("Senescência");

  fireEvent.click(screen.getByLabelText("Publicar Senescência"));

  await waitFor(() => expect(publishLifeStageTrack).toHaveBeenCalledWith(2));
});

test("arquiva a trilha já publicada", async () => {
  vi.mocked(archiveLifeStageTrack).mockResolvedValue({ ...adolescencia, status: "archived" });
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Arquivar Adolescência"));

  await waitFor(() => expect(archiveLifeStageTrack).toHaveBeenCalledWith(1));
});

test("esconde publicar e editar de quem só escreve conteúdo", async () => {
  signInAs(["academic_author"]);
  renderPage();
  await screen.findByText("Adolescência");

  expect(screen.queryByLabelText("Publicar Senescência")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Editar Adolescência")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Visualizar Adolescência")).toBeInTheDocument();
});

test("deixa o professor revisor publicar sem poder editar", async () => {
  signInAs(["reviewer_professor"]);
  renderPage();
  await screen.findByText("Senescência");

  expect(screen.getByLabelText("Publicar Senescência")).toBeInTheDocument();
  expect(screen.queryByLabelText("Editar Senescência")).not.toBeInTheDocument();
});

test("vincula conteúdos na ordem escolhida", async () => {
  const primeiro = trackContent();
  const segundo = trackContent({ id: 102, title: "Absorventes", slug: "absorventes" });

  vi.mocked(getLifeStageTrack).mockResolvedValue({ ...adolescencia, contents: [] });
  vi.mocked(listAdminContents).mockResolvedValue([primeiro, segundo]);
  vi.mocked(syncLifeStageTrackContents).mockResolvedValue(adolescencia);

  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Vincular conteúdos em Adolescência"));

  fireEvent.click(await screen.findByLabelText("Vincular Absorventes"));
  fireEvent.click(await screen.findByLabelText("Vincular Cólica menstrual"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar ordem" }));

  await waitFor(() => expect(syncLifeStageTrackContents).toHaveBeenCalledWith(1, [102, 101]));
});

test("reordena os conteúdos já vinculados", async () => {
  const primeiro = trackContent();
  const segundo = trackContent({ id: 102, title: "Absorventes", slug: "absorventes" });

  vi.mocked(getLifeStageTrack).mockResolvedValue({
    ...adolescencia,
    contents: [
      { id: 101, title: "Cólica menstrual", slug: "colica-menstrual", status: "published" },
      { id: 102, title: "Absorventes", slug: "absorventes", status: "published" },
    ],
  });
  vi.mocked(listAdminContents).mockResolvedValue([primeiro, segundo]);
  vi.mocked(syncLifeStageTrackContents).mockResolvedValue(adolescencia);

  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Vincular conteúdos em Adolescência"));

  fireEvent.click(await screen.findByLabelText("Descer Cólica menstrual"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar ordem" }));

  await waitFor(() => expect(syncLifeStageTrackContents).toHaveBeenCalledWith(1, [102, 101]));
});

test("filtra o seletor pela faixa etária da trilha", async () => {
  vi.mocked(getLifeStageTrack).mockResolvedValue({ ...adolescencia, contents: [] });
  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Vincular conteúdos em Adolescência"));

  await waitFor(() => expect(listAdminContents).toHaveBeenCalledWith({ ageRangeId: 10 }));
});

test("remove um conteúdo da trilha", async () => {
  vi.mocked(getLifeStageTrack).mockResolvedValue({
    ...adolescencia,
    contents: [{ id: 101, title: "Cólica menstrual", slug: "colica-menstrual", status: "published" }],
  });
  vi.mocked(syncLifeStageTrackContents).mockResolvedValue(adolescencia);

  renderPage();
  await screen.findByText("Adolescência");

  fireEvent.click(screen.getByLabelText("Vincular conteúdos em Adolescência"));
  fireEvent.click(await screen.findByLabelText("Remover Cólica menstrual da trilha"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar ordem" }));

  await waitFor(() => expect(syncLifeStageTrackContents).toHaveBeenCalledWith(1, []));
});

test("exclui apenas a trilha em rascunho e sem conteúdos", async () => {
  vi.mocked(deleteLifeStageTrack).mockResolvedValue(undefined);
  renderPage();
  await screen.findByText("Senescência");

  expect(screen.queryByLabelText("Excluir Adolescência")).not.toBeInTheDocument();

  fireEvent.click(screen.getByLabelText("Excluir Senescência"));

  await waitFor(() => expect(deleteLifeStageTrack).toHaveBeenCalledWith(2));
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
