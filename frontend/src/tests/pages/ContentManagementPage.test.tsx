import { render, screen } from "@testing-library/react";
import ContentListPage from "@/pages/ContentListPage";

test("renders content management page in Portuguese", () => {
  render(<ContentListPage />);

  expect(screen.getByText("Conteúdos educativos")).toBeInTheDocument();
});
