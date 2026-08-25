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
  | 'rosa'
  | 'lilas'
  | 'roxo'
  | 'magenta'
  | 'fertile'
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
    borderRadius: theme.radii.xl,
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
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
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
  fertile: {
    backgroundColor: theme.colors.fertileLight,
    borderColor: theme.colors.fertile,
  },
  lilas: {
    backgroundColor: theme.colors.lilasLight,
    borderColor: theme.colors.lilas,
  },
  magenta: {
    backgroundColor: theme.colors.rosaLight,
    borderColor: theme.colors.magenta,
  },
  primary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
  },
  rosa: {
    backgroundColor: theme.colors.rosaLight,
    borderColor: theme.colors.rosa,
  },
  roxo: {
    backgroundColor: theme.colors.roxoLight,
    borderColor: theme.colors.roxo,
  },
  warning: {
    backgroundColor: theme.colors.ovulationLight,
    borderColor: theme.colors.ovulation,
  },
});
