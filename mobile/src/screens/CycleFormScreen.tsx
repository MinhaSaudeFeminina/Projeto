import { Text, View } from "react-native";

export function CycleFormScreen() {
  return (
    <View accessibilityLabel="Registro de ciclo menstrual">
      <Text>Registrar menstruação</Text>
      <Text>Informe início, término e intensidade do fluxo se desejar.</Text>
    </View>
  );
}
