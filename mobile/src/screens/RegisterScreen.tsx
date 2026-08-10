import { Text, View } from "react-native";

export function RegisterScreen() {
  return (
    <View accessibilityLabel="Cadastro de usuária">
      <Text>Crie sua conta</Text>
      <Text>Informe nome, e-mail, senha, data de nascimento e aceite os termos.</Text>
    </View>
  );
}
