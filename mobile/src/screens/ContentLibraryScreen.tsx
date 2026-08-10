import { Text, View } from "react-native";
import { ContentSearchInput } from "@/components/ContentSearchInput";

export function ContentLibraryScreen() {
  return (
    <View accessibilityLabel="Biblioteca de conteúdos educativos">
      <Text>Biblioteca</Text>
      <ContentSearchInput value="" onChangeText={() => undefined} />
      <Text>Conteúdos publicados aparecerão aqui com acentuação correta.</Text>
    </View>
  );
}
