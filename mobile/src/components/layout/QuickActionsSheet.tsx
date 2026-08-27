import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { quickActions } from '../../data/staticContent';
import type { DayLogFocus } from '../../utils/navigationTypes';
import { theme } from '../../utils/theme';

export type QuickActionRoute =
  | 'AnonymousQuestion'
  | 'Contents'
  | 'Cycle'
  | 'DayLog'
  | 'Reminders';

/** What the day log should open on, and which symptom it should pre-tick. */
export type QuickActionTarget = {
  route: QuickActionRoute;
  focus?: DayLogFocus;
  symptomKey?: string;
};

export type QuickActionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (target: QuickActionTarget) => void;
};

export function getQuickActionTarget(id: string): QuickActionTarget | null {
  if (id === 'pergunta') {
    return { route: 'AnonymousQuestion' };
  }

  if (id === 'conteudo') {
    return { route: 'Contents' };
  }

  if (id === 'lembrete') {
    return { route: 'Reminders' };
  }

  if (id === 'menstruacao') {
    return { focus: 'flow', route: 'DayLog' };
  }

  if (id === 'humor') {
    return { focus: 'mood', route: 'DayLog' };
  }

  // The catalog keys come from `symptomCatalogSeed`, so "Registrar colica"
  // opens the day log with colica already ticked instead of dropping the user
  // in an undifferentiated list.
  if (id === 'colica' || id === 'corrimento') {
    return { focus: 'symptoms', route: 'DayLog', symptomKey: id };
  }

  if (id === 'sintomas') {
    return { focus: 'symptoms', route: 'DayLog' };
  }

  return null;
}

export function QuickActionsSheet({
  visible,
  onClose,
  onNavigate,
}: QuickActionsSheetProps) {
  function handleAction(id: string) {
    const target = getQuickActionTarget(id);

    if (!target) {
      return;
    }

    onClose();
    onNavigate(target);
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
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
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
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
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
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.lg,
  },
});
