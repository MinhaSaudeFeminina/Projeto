import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../utils/theme';

export type CycleRingProps = {
  /** Big number in the middle. */
  value: string;
  caption: string;
  label?: string;
  tone?: 'primary' | 'warning';
};

/**
 * The cycle-day indicator. A plain bordered circle rather than an SVG arc:
 * `react-native-svg` is not a dependency, and the number is what the user
 * actually reads.
 */
export function CycleRing({
  value,
  caption,
  label,
  tone = 'primary',
}: CycleRingProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.ring, tone === 'warning' && styles.warningRing]}>
        <Text style={[styles.value, tone === 'warning' && styles.warningValue]}>
          {value}
        </Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
  },
  ring: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.primary,
    borderRadius: 60,
    borderWidth: 6,
    height: 120,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    width: 120,
    ...theme.shadows.card,
  },
  value: {
    color: theme.colors.primaryDark,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.xxl,
    lineHeight: 36,
  },
  warningRing: {
    borderColor: theme.colors.warning,
  },
  warningValue: {
    color: theme.colors.warningForeground,
  },
});
