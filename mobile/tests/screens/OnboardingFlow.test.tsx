import React from "react";
import { render } from "@testing-library/react-native";
import { OnboardingScreen } from "@/screens/OnboardingScreen";

test("renders welcoming Portuguese onboarding copy", () => {
  const { getByText } = render(<OnboardingScreen />);

  expect(getByText("Minha Saúde Feminina")).toBeTruthy();
  expect(getByText("Informação confiável, acolhedora e sem julgamentos.")).toBeTruthy();
});
