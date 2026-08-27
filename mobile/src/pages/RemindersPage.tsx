import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { AppTextInput } from '../components/ui/AppTextInput';
import { LoadingState } from '../components/ui/LoadingState';
import { useApiResource } from '../hooks/useApiResource';
import {
  addReminder,
  getReminderFeedbackMessage,
  getUserReminders,
  reminderRecurrences,
  toggleReminderCompleted,
  type ReminderRecurrence,
} from '../services/remindersService';
import { brDateToIso, maskBrDate } from '../utils/date';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type RemindersPageProps = RootStackScreenProps<'Reminders'>;

export function RemindersPage({ navigation }: RemindersPageProps) {
  const { data, error: loadError, loading, reload } = useApiResource(
    getUserReminders,
    [],
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>('nenhuma');
  const handleBack = () => navigateBackOrToday(navigation);
  const reminders = data ?? [];

  const toggleComplete = async (id: string) => {
    const result = await toggleReminderCompleted(id);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setError(null);
    setFeedback(
      getReminderFeedbackMessage(
        result.data.find((reminder) => reminder.id === id),
      ),
    );
    reload();
  };

  const handleAdd = async () => {
    const isoDate = brDateToIso(date);

    if (!isoDate) {
      setError('Informe uma data no formato DD/MM/AAAA.');
      return;
    }

    const result = await addReminder({
      date: isoDate,
      recurrence,
      title,
      type: 'outro',
    });

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    handleBack();
  };

  return (
    <AppScreen>
      <AppHeader
        onBack={handleBack}
        rightAction={
          <AppButton
            accessibilityLabel="Adicionar lembrete"
            onPress={() => setFormOpen((current) => !current)}
            title={formOpen ? '-' : '+'}
            variant="secondary"
          />
        }
        title="Lembretes"
      />

      {(error ?? loadError) && (
        <ErrorMessage compact message={error ?? loadError!} />
      )}

      {formOpen && (
        <AppCard title="Novo lembrete">
          <AppTextInput
            label="Titulo"
            onChangeText={setTitle}
            placeholder="Consulta ginecologica"
            value={title}
          />
          <AppTextInput
            inputMode="numeric"
            label="Data"
            maxLength={10}
            onChangeText={(value) => setDate(maskBrDate(value))}
            placeholder="DD/MM/AAAA"
            value={date}
          />
          <View style={styles.recurrence}>
            <Text style={styles.recurrenceLabel}>Repetir</Text>
            <View style={styles.recurrenceOptions}>
              {reminderRecurrences.map((option) => (
                <AppChip
                  key={option.value}
                  label={option.label}
                  onPress={() => setRecurrence(option.value)}
                  selected={recurrence === option.value}
                />
              ))}
            </View>
          </View>
          <AppButton fullWidth onPress={handleAdd} title="Salvar lembrete" />
        </AppCard>
      )}
      {feedback && (
        <FeedbackMessage
          message={feedback}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <View style={styles.list}>
        {reminders.map((reminder) => (
          <AppCard key={reminder.id} style={reminder.completed && styles.done}>
            <View style={styles.reminderRow}>
              <Pressable
                accessibilityLabel={
                  reminder.recurring
                    ? 'Concluir esta ocorrencia do lembrete'
                    : reminder.completed
                      ? 'Marcar lembrete como pendente'
                      : 'Marcar lembrete como concluido'
                }
                accessibilityRole="checkbox"
                accessibilityState={{ checked: reminder.completed }}
                onPress={() => toggleComplete(reminder.id)}
                style={[
                  styles.checkbox,
                  reminder.completed && styles.checkedBox,
                ]}
              >
                {reminder.completed && <Text style={styles.check}>✓</Text>}
              </Pressable>
              <View style={styles.reminderCopy}>
                <Text
                  style={[
                    styles.reminderTitle,
                    reminder.completed && styles.doneText,
                  ]}
                >
                  {reminder.title}
                </Text>
                <Text style={styles.date}>
                  {reminder.formattedDate}
                  {reminder.recurring ? ` - ${reminder.recurrenceLabel}` : ''}
                </Text>
              </View>
              <Text style={styles.type}>{reminder.type}</Text>
            </View>
          </AppCard>
        ))}
      </View>

      {loading && <LoadingState message="Carregando seus lembretes." />}

      {!loading && reminders.length === 0 && (
        <EmptyState
          message="Adicione consultas, exames ou vacinas, com ou sem repeticao. Os lembretes ficam salvos apenas neste dispositivo."
          title="Nenhum lembrete cadastrado"
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  check: {
    color: theme.colors.primaryForeground,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.md,
    lineHeight: 18,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.mutedForeground,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkedBox: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  date: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
  },
  done: {
    opacity: 0.58,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  list: {
    gap: theme.spacing.md,
  },
  recurrence: {
    gap: theme.spacing.sm,
  },
  recurrenceLabel: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: theme.typography.sizes.sm,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  reminderCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  reminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  reminderTitle: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
    lineHeight: 22,
  },
  type: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.sm,
    color: theme.colors.secondaryForeground,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xs,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
});
