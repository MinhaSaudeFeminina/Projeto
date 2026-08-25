import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type AppToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppToggle({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
}: AppToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.container, disabled && styles.disabled, style]}
    >
      {(label || description) && (
        <View style={styles.copy}>
          {label && <Text style={styles.label}>{label}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}
      <Switch
        disabled={disabled}
        ios_backgroundColor={theme.colors.input}
        onValueChange={onValueChange}
        thumbColor={theme.colors.primaryForeground}
        trackColor={{
          false: theme.colors.input,
          true: theme.colors.primary,
        }}
        value={value}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 48,
    width: '100%',
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  description: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});
