import { Text, View } from "react-native";

export function ContentDetailScreen() {
  return (
    <View accessibilityLabel="Detalhe do conteúdo educativo">
      <Text>Conteúdo educativo</Text>
      <Text>Este conteúdo informa, mas não substitui atendimento profissional.</Text>
    </View>
  );
}
