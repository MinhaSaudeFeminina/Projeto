import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "@/pages/DashboardPage";

test("renders the administrative dashboard shell", () => {
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

  expect(screen.getByText("Painel Minha Saúde Feminina")).toBeInTheDocument();
  expect(screen.getByText("Próximas ações editoriais")).toBeInTheDocument();
});
