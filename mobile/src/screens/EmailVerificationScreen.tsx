import { Text, View } from "react-native";

export function EmailVerificationScreen() {
  return (
    <View accessibilityLabel="Validação de e-mail">
      <Text>Valide seu e-mail</Text>
      <Text>O uso completo será liberado após a validação.</Text>
    </View>
  );
}
