import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  onBack,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>
        {leftAction ??
          (onBack ? (
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              onPress={onBack}
              style={styles.backButton}
            >
              <Text style={styles.backText}>{'<'}</Text>
            </Pressable>
          ) : null)}
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.side}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.extraBold,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 56,
  },
  copy: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
  },
  side: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.extraBold,
    textAlign: 'center',
  },
});
