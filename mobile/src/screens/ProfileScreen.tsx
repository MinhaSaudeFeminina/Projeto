import { Text, View } from "react-native";

export function ProfileScreen() {
  return (
    <View accessibilityLabel="Perfil da usuária">
      <Text>Meu perfil</Text>
      <Text>Idade e faixa etária são calculadas pela data de nascimento.</Text>
    </View>
  );
}
