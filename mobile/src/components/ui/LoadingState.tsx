import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type LoadingStateProps = {
  title?: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
};

export function LoadingState({
  title = 'Carregando',
  message = 'Aguarde um instante.',
  style,
}: LoadingStateProps) {
  return (
    <View
      accessibilityRole="progressbar"
      style={[styles.container, style]}
    >
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.md,
    justifyContent: 'center',
    minHeight: 160,
    padding: theme.spacing.xl,
  },
  copy: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  message: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
  },
});
