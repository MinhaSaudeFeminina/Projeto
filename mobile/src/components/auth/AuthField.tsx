import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { authColors } from './authTheme';

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
        <Ionicons color={authColors.rose} name={icon} size={21} />
        <TextInput
          placeholderTextColor={authColors.muted}
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
    color: authColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    color: authColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    color: authColors.text,
    flex: 1,
    fontSize: 16,
    height: 54,
    paddingVertical: 0,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: authColors.input,
    borderColor: authColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 8,
  },
  inputShellError: {
    borderColor: authColors.primary,
  },
});
