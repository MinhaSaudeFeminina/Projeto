import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function AppTextInput({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  editable = true,
  multiline,
  style,
  ...textInputProps
}: AppTextInputProps) {
  const description = error ?? helperText;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        editable={editable}
        multiline={multiline}
        placeholderTextColor={theme.colors.mutedForeground}
        style={[
          styles.input,
          multiline && styles.multiline,
          !editable && styles.disabled,
          error && styles.inputError,
          inputStyle,
          style,
        ]}
        {...textInputProps}
      />
      {description && (
        <Text style={[styles.description, error && styles.error]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
    width: '100%',
  },
  description: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: theme.colors.destructive,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.input,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    // TextInput does not inherit the default Text font set in App.tsx.
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  label: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: theme.typography.sizes.sm,
  },
  multiline: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
});
