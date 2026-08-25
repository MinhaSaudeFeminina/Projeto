import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';

export type MedicalDisclaimerProps = {
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function MedicalDisclaimer({
  compact = false,
  style,
}: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <Text style={[styles.compactText, style]}>
        Essas informacoes nao substituem avaliacao medica.
      </Text>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.text}>
        Estas informacoes nao substituem avaliacao medica. Procure sempre a UBS
        para confirmacao e acompanhamento.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
    paddingVertical: theme.spacing.sm,
    textAlign: 'center',
  },
  container: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  icon: {
    color: theme.colors.roxo,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.extraBold,
    lineHeight: 20,
  },
  text: {
    color: theme.colors.accentForeground,
    flex: 1,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
  },
});
