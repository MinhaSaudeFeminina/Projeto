import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AuthField, type AuthFieldProps } from './AuthField';
import { authColors } from './authTheme';

export type PasswordFieldProps = Omit<AuthFieldProps, 'icon' | 'trailing'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      autoCapitalize="none"
      icon="lock-closed-outline"
      secureTextEntry={!visible}
      trailing={
        <Pressable
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.visibilityButton}
        >
          <Ionicons
            color={authColors.muted}
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={21}
          />
        </Pressable>
      }
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  visibilityButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 40,
  },
});
