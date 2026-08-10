import { TextInput } from "react-native";

export function ContentSearchInput({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) {
  return (
    <TextInput
      accessibilityLabel="Buscar conteúdos"
      placeholder="Buscar por menstruação, prevenção..."
      value={value}
      onChangeText={onChangeText}
    />
  );
}
