import React from "react";
import { render } from "@testing-library/react-native";
import { SymptomFormScreen } from "@/screens/SymptomFormScreen";

test("renders non diagnostic symptom guidance copy", () => {
  const { getByText } = render(<SymptomFormScreen />);

  expect(getByText("Registrar sintoma")).toBeTruthy();
  expect(getByText("Em sinais de alerta, procure atendimento profissional. O app não diagnostica doenças.")).toBeTruthy();
});
