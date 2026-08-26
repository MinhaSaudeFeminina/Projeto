import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { quickActions } from '../../data/staticContent';
import { theme } from '../../utils/theme';

export type QuickActionRoute =
  | 'AnonymousQuestion'
  | 'Contents'
  | 'Cycle'
  | 'Reminders'
  | 'Symptoms';

export type QuickActionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: QuickActionRoute, sourceAction?: string) => void;
};

export function getQuickActionRoute(id: string): QuickActionRoute | null {
  if (id === 'pergunta') {
    return 'AnonymousQuestion';
  }

  if (id === 'conteudo') {
    return 'Contents';
  }

  if (
    id === 'sintomas' ||
    id === 'corrimento' ||
    id === 'colica' ||
    id === 'humor'
  ) {
    return 'Symptoms';
  }

  if (id === 'lembrete') {
    return 'Reminders';
  }

  if (id === 'menstruacao') {
    return 'Cycle';
  }

  return null;
}

export function QuickActionsSheet({
  visible,
  onClose,
  onNavigate,
}: QuickActionsSheetProps) {
  function handleAction(id: string) {
    const route = getQuickActionRoute(id);

    if (!route) {
      return;
    }

    onClose();
    onNavigate(route, route === 'Symptoms' ? id : undefined);
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Acao rapida</Text>
            <Pressable
              accessibilityLabel="Fechar acoes rapidas"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>x</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {quickActions.map((action) => (
              <Pressable
                accessibilityRole="button"
                key={action.id}
                onPress={() => handleAction(action.id)}
                style={({ pressed }) => [
                  styles.action,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.lg,
    flexBasis: '48%',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 72,
    padding: theme.spacing.md,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    color: theme.colors.secondaryForeground,
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 19,
  },
  backdrop: {
    backgroundColor: theme.colors.backdrop,
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radii.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  pressed: {
    backgroundColor: theme.colors.accent,
    opacity: 0.88,
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extraBold,
  },
});
