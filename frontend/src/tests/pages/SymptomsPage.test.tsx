import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import SymptomsPage from "@/pages/SymptomsPage";
import type { AdminSymptom } from "@/services/api/symptomApi";

const symptomApi = vi.hoisted(() => ({
  listAdminSymptoms: vi.fn(),
  createAdminSymptom: vi.fn(),
  updateAdminSymptom: vi.fn(),
  deleteAdminSymptom: vi.fn(),
}));

vi.mock("@/services/api/symptomApi", () => symptomApi);

const pelvicPain: AdminSymptom = {
  id: 2,
  name: "Dor pélvica",
  type: "dor",
  short_description: "Dor na região pélvica.",
  full_description: "Queixa persistente na parte inferior do abdômen.",
  icon: "AlertTriangle",
  category: "Saúde íntima",
  show_in_app: true,
  ask_intensity: true,
  ask_notes: true,
  generate_ubs_alert: false,
  orientation_text: "Registre duração e intensidade.",
  severity_alert_text: "Dor intensa requer avaliação profissional.",
  sort_order: 2,
  created_by: 1,
  updated_by: 1,
  created_at: "2026-08-25T10:00:00.000Z",
  updated_at: "2026-08-25T10:00:00.000Z",
};

function renderPage(roles: string[] = ["admin"]) {
  window.localStorage.setItem("msf_admin_token", "token");
  window.localStorage.setItem("msf_admin_user", JSON.stringify({
    id: 1,
    name: "Administradora",
    email: "admin@example.com",
    roles,
  }));

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SymptomsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  symptomApi.listAdminSymptoms.mockResolvedValue([pelvicPain]);
  symptomApi.createAdminSymptom.mockResolvedValue(pelvicPain);
  symptomApi.updateAdminSymptom.mockImplementation(async (_id: number, changes: Partial<AdminSymptom>) => ({
    ...pelvicPain,
    ...changes,
  }));
  symptomApi.deleteAdminSymptom.mockResolvedValue(undefined);
});

test("loads the symptom catalog from the administrative API", async () => {
  renderPage();

  expect(await screen.findByText("Dor pélvica")).toBeInTheDocument();
  expect(screen.getByText("Saúde íntima")).toBeInTheDocument();
  expect(symptomApi.listAdminSymptoms).toHaveBeenCalledWith({ q: "" });
});

test("searches the catalog through the API", async () => {
  renderPage();
  await screen.findByText("Dor pélvica");

  fireEvent.change(screen.getByPlaceholderText("Buscar sintoma..."), { target: { value: "dor pelvica" } });

  await waitFor(() => expect(symptomApi.listAdminSymptoms).toHaveBeenLastCalledWith({ q: "dor pelvica" }));
});

test("persists the UBS alert switch directly from the table", async () => {
  renderPage();
  const row = (await screen.findByText("Dor pélvica")).closest("tr");

  fireEvent.click(within(row!).getByRole("switch", { name: "Alerta UBS para Dor pélvica" }));

  await waitFor(() => expect(symptomApi.updateAdminSymptom).toHaveBeenCalledWith(2, {
    generate_ubs_alert: true,
  }));
});

test("edits and saves a controlled symptom form", async () => {
  renderPage();

  fireEvent.click(await screen.findByRole("button", { name: "Editar Dor pélvica" }));
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Dor pélvica recorrente" } });
  fireEvent.click(screen.getByRole("switch", { name: "Gerar alerta UBS" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(symptomApi.updateAdminSymptom).toHaveBeenCalledWith(2, expect.objectContaining({
    name: "Dor pélvica recorrente",
    generate_ubs_alert: true,
  })));
});

test("creates a new catalog item", async () => {
  renderPage();

  fireEvent.click(await screen.findByRole("button", { name: "Novo sintoma" }));
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Náusea" } });
  fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "físico" } });
  fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "Bem-estar" } });
  fireEvent.change(screen.getByLabelText("Descrição curta"), { target: { value: "Sensação de enjoo." } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(symptomApi.createAdminSymptom).toHaveBeenCalledWith(expect.objectContaining({
    name: "Náusea",
    type: "físico",
    category: "Bem-estar",
    short_description: "Sensação de enjoo.",
  })));
});

test("deletes an unused catalog item after confirmation", async () => {
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  renderPage();

  fireEvent.click(await screen.findByRole("button", { name: "Excluir Dor pélvica" }));

  await waitFor(() => expect(symptomApi.deleteAdminSymptom).toHaveBeenCalledWith(2));
  confirm.mockRestore();
});

test("hides catalog mutation actions from non admin roles", async () => {
  renderPage(["reviewer_professor"]);

  expect(await screen.findByText("Dor pélvica")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Novo sintoma" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Editar Dor pélvica" })).not.toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Alerta UBS para Dor pélvica" })).toBeDisabled();
});
