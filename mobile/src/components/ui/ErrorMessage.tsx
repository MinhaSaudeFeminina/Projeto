import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type ErrorMessageProps = {
  title?: string;
  message: string;
  action?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ErrorMessage({
  title = 'Algo deu errado',
  message,
  action,
  compact = false,
  style,
}: ErrorMessageProps) {
  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <View style={styles.copy}>
        {!compact && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: theme.spacing.sm,
  },
  compact: {
    padding: theme.spacing.md,
  },
  container: {
    backgroundColor: theme.colors.destructiveLight,
    borderColor: theme.colors.destructive,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  copy: {
    gap: theme.spacing.xs,
  },
  message: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  title: {
    color: theme.colors.destructive,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});
