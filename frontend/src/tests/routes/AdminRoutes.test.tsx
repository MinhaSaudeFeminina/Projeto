import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminRoutes } from "@/routes/AdminRoutes";
import { saveAdminSession } from "@/state/adminAuthStore";

beforeEach(() => {
  window.localStorage.clear();
});

test("redirects unauthenticated administrative users to login", () => {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/login" element={<p>Login administrativo</p>} />
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<p>Painel administrativo</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByText("Login administrativo")).toBeInTheDocument();
  expect(screen.queryByText("Painel administrativo")).not.toBeInTheDocument();
});

test("renders protected administrative routes when a session token exists", () => {
  saveAdminSession("admin-token", {
    id: 1,
    name: "Dra. Ana Luisa",
    email: "admin@example.com",
    roles: ["admin"],
  });

  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/login" element={<p>Login administrativo</p>} />
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<p>Painel administrativo</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByText("Painel administrativo")).toBeInTheDocument();
  expect(screen.queryByText("Login administrativo")).not.toBeInTheDocument();
});
