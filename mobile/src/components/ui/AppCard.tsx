import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type AppCardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function AppCard({
  children,
  title,
  subtitle,
  footer,
  style,
  contentStyle,
  titleStyle,
}: AppCardProps) {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  content: {
    gap: theme.spacing.md,
  },
  footer: {
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  title: {
    color: theme.colors.cardForeground,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 24,
  },
});
