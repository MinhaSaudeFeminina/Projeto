import React from "react";
import { render } from "@testing-library/react-native";
import { ContentLibraryScreen } from "@/screens/ContentLibraryScreen";

test("renders content library with Portuguese copy", () => {
  const { getByText, getByLabelText } = render(<ContentLibraryScreen />);

  expect(getByText("Biblioteca")).toBeTruthy();
  expect(getByLabelText("Buscar conteúdos")).toBeTruthy();
});
