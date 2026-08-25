import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AdminLoginPage from "@/pages/AdminLoginPage";
import { loginAdmin } from "@/services/api/adminAuthApi";

const navigate = vi.fn();
const toast = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("@/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => toast(...args),
}));

vi.mock("@/services/api/adminAuthApi", () => ({
  loginAdmin: vi.fn(),
}));

beforeEach(() => {
  navigate.mockReset();
  toast.mockReset();
  window.localStorage.clear();
  vi.mocked(loginAdmin).mockReset();
});

test("renders the administrative login form in Portuguese", () => {
  render(
    <MemoryRouter>
      <AdminLoginPage />
    </MemoryRouter>,
  );

  expect(screen.getByText("Bem-vinda de volta")).toBeInTheDocument();
  expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  expect(screen.getByLabelText("Senha")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
});

test("requires email and password before submitting admin login", () => {
  render(
    <MemoryRouter>
      <AdminLoginPage />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

  expect(loginAdmin).not.toHaveBeenCalled();
  expect(toast).toHaveBeenCalledWith({
    title: "Preencha todos os campos",
    variant: "destructive",
  });
});

test("saves the administrative session and opens the dashboard after login", async () => {
  vi.mocked(loginAdmin).mockResolvedValue({
    token: "admin-token",
    user: {
      id: 1,
      name: "Dra. Ana Luisa",
      email: "admin@example.com",
      roles: ["admin"],
    },
  });

  render(
    <MemoryRouter>
      <AdminLoginPage />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "admin@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

  await waitFor(() => {
    expect(loginAdmin).toHaveBeenCalledWith("admin@example.com", "password");
  });

  expect(window.localStorage.getItem("msf_admin_token")).toBe("admin-token");
  expect(navigate).toHaveBeenCalledWith("/");
});
