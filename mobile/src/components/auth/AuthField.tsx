import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { theme } from '../../utils/theme';

export type AuthFieldProps = TextInputProps & {
  error?: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  trailing?: ReactNode;
};

export function AuthField({
  error,
  icon,
  label,
  trailing,
  ...inputProps
}: AuthFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <Ionicons color={theme.colors.rose} name={icon} size={21} />
        <TextInput
          placeholderTextColor={theme.colors.mutedForeground}
          style={styles.input}
          {...inputProps}
        />
        {trailing}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldError: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: theme.typography.sizes.xs,
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
  },
  input: {
    color: theme.colors.foreground,
    flex: 1,
    // TextInput does not inherit the default Text font set in App.tsx.
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    height: 54,
    paddingVertical: 0,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 8,
  },
  inputShellError: {
    borderColor: theme.colors.primary,
  },
});
