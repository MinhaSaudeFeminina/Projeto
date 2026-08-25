import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

const adminUserApi = vi.hoisted(() => ({
  listAdminUsers: vi.fn(),
}));

const rolePermissionApi = vi.hoisted(() => ({
  listRoles: vi.fn(),
}));

vi.mock("@/services/api/adminUserApi", () => adminUserApi);
vi.mock("@/services/api/rolePermissionApi", () => rolePermissionApi);

beforeEach(() => {
  adminUserApi.listAdminUsers.mockReset();
  rolePermissionApi.listRoles.mockReset();
});

test("renders administrative users with roles and active status in Portuguese", async () => {
  adminUserApi.listAdminUsers.mockResolvedValue([
    {
      id: 1,
      name: "Dra. Laura Admin",
      email: "laura.admin@example.com",
      role: "admin",
      is_active: true,
      last_login_at: "2026-06-17T10:00:00Z",
    },
    {
      id: 2,
      name: "Profa. Helena Revisora",
      email: "helena.revisora@example.com",
      role: "reviewer_professor",
      is_active: false,
      last_login_at: null,
    },
  ]);
  rolePermissionApi.listRoles.mockResolvedValue([
    { id: 1, key: "academic_author", name: "Acadêmica/autora" },
    { id: 2, key: "reviewer_professor", name: "Revisor/professor" },
    { id: 3, key: "admin", name: "Admin" },
  ]);

  const pagePath = "../../pages/AdminUserListPage";
  const { default: AdminUserListPage } = await import(/* @vite-ignore */ pagePath);

  render(
    <MemoryRouter>
      <AdminUserListPage />
    </MemoryRouter>,
  );

  expect(screen.getByText("Usuárias administrativas")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /nova usuária/i })).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Dra. Laura Admin")).toBeInTheDocument();
  });

  expect(screen.getByText("Profa. Helena Revisora")).toBeInTheDocument();
  expect(screen.getByText("Ativa")).toBeInTheDocument();
  expect(screen.getByText("Inativa")).toBeInTheDocument();
  expect(screen.getByText("Revisor/professor")).toBeInTheDocument();
});
