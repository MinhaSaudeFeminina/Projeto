import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../utils/theme';

export type FeedbackMessageVariant = 'success' | 'info' | 'warning';

export type FeedbackMessageProps = {
  message: string;
  title?: string;
  variant?: FeedbackMessageVariant;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function FeedbackMessage({
  message,
  title,
  variant = 'success',
  onDismiss,
  style,
}: FeedbackMessageProps) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, variantStyles[variant], style]}
    >
      <View style={styles.copy}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
      </View>
      {onDismiss && (
        <Pressable
          accessibilityLabel="Fechar mensagem"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onDismiss}
          style={styles.dismiss}
        >
          <Ionicons color={theme.colors.foreground} name="close" size={21} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  dismiss: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  message: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  title: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
  },
});

const variantStyles = StyleSheet.create({
  info: {
    backgroundColor: theme.colors.infoLight,
    borderColor: theme.colors.info,
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
