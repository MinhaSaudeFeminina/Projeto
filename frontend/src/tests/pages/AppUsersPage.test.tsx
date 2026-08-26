import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, vi } from "vitest";
import AppUsersPage from "@/pages/AppUsersPage";
import { listAppUsers, updateAppUser } from "@/services/api/appUserApi";
import { listTaxonomies } from "@/services/api/taxonomyApi";

vi.mock("@/services/api/appUserApi", () => ({
  listAppUsers: vi.fn(),
  updateAppUser: vi.fn(),
}));

vi.mock("@/services/api/taxonomyApi", () => ({
  listTaxonomies: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const users = [
  {
    id: 1,
    name: "Maria Saúde",
    email: "maria@example.com",
    age: 28,
    birth_date: "1998-03-10",
    life_stage_id: 1,
    life_stage: "Fase adulta",
    is_active: true,
    notifications_active: true,
    last_access_at: "2026-03-19T10:00:00Z",
    created_at: "2026-01-01T10:00:00Z",
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AppUsersPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listAppUsers).mockResolvedValue(users);
  vi.mocked(listTaxonomies).mockResolvedValue({
    categories: [],
    life_stages: [{ id: 1, key: "fase_adulta", name: "Fase adulta" }],
    age_ranges: [],
  });
  vi.mocked(updateAppUser).mockResolvedValue({ ...users[0], is_active: false });
});

test("lista usuárias cadastradas vindas da API", async () => {
  renderPage();

  expect(await screen.findByText("Maria Saúde")).toBeInTheDocument();
  expect(screen.getByText("maria@example.com")).toBeInTheDocument();
  expect(screen.getByText("Fase adulta")).toBeInTheDocument();
  expect(screen.getByText("ativo")).toBeInTheDocument();
});

test("envia edição e inativação de usuária para a API", async () => {
  renderPage();

  fireEvent.click(await screen.findByRole("button", { name: "Editar Maria Saúde" }));
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Maria Eduarda" } });
  fireEvent.click(screen.getByLabelText("Conta ativa"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(updateAppUser).toHaveBeenCalledWith(1, {
    name: "Maria Eduarda",
    email: "maria@example.com",
    birth_date: "1998-03-10",
    life_stage_id: 1,
    notifications_active: true,
    is_active: false,
  }));
});
