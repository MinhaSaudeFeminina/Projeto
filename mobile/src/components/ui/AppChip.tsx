import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type AppChipTone =
  | 'default'
  | 'primary'
  | 'rose'
  | 'peach'
  | 'success'
  | 'warning';

export type AppChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: ReactNode;
  tone?: AppChipTone;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppChip({
  label,
  icon,
  tone = 'default',
  selected = false,
  disabled,
  style,
  textStyle,
  ...pressableProps
}: AppChipProps) {
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        toneStyles[tone],
        selected && styles.selected,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          selected && styles.selectedLabel,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: theme.colors.border,
    // Web badges are fully rounded.
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 34,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: theme.typography.sizes.sm,
    maxWidth: 180,
  },
  pressed: {
    opacity: 0.82,
  },
  selected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectedLabel: {
    color: theme.colors.primaryForeground,
  },
});

const toneStyles = StyleSheet.create({
  default: {
    backgroundColor: theme.colors.muted,
  },
  peach: {
    backgroundColor: theme.colors.peachLight,
    borderColor: theme.colors.peach,
  },
  primary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
  },
  rose: {
    backgroundColor: theme.colors.roseLight,
    borderColor: theme.colors.rose,
  },
  success: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  warning: {
    backgroundColor: theme.colors.warningLight,
    borderColor: theme.colors.warning,
  },
});
