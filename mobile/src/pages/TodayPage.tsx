import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { AppScreen } from '../components/layout/AppScreen';
import { AppHeader } from '../components/layout/AppHeader';
import { useAppContext } from '../context/AppContext';
import { useApiResource } from '../hooks/useApiResource';
import { getCycleSummary } from '../services/cycleService';
import { getUserReminders } from '../services/remindersService';
import {
  describeIntensity,
  getUserSymptomRecords,
} from '../services/symptomsService';
import { formatShortDate, toIsoDate } from '../utils/date';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

const phaseLabels = {
  folicular: 'Folicular',
  lutea: 'Lutea',
  menstrual: 'Menstrual',
  ovulatoria: 'Ovulatoria',
} as const;

const phaseTones = {
  folicular: 'lilas',
  lutea: 'roxo',
  menstrual: 'rosa',
  ovulatoria: 'warning',
} as const;

export function TodayPage() {
  const navigation = useNavigation<RootStackNavigation>();
  const { profile } = useAppContext();
  const today = useMemo(() => new Date(), []);
  const todayIsoDate = toIsoDate(today);

  const cycle = useApiResource(() => getCycleSummary(today), [todayIsoDate]);
  const symptoms = useApiResource(getUserSymptomRecords, []);
  const reminders = useApiResource(getUserReminders, []);

  if (cycle.loading) {
    return (
      <AppScreen>
        <LoadingState message="Carregando seu resumo de hoje." />
      </AppScreen>
    );
  }

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const todaySymptoms = (symptoms.data ?? []).filter(
    (record) => record.occurred_on === todayIsoDate,
  );
  // A repeating reminder always has a next occurrence, so insertion order is not
  // enough: the card shows the closest dates.
  const upcomingReminders = (reminders.data ?? [])
    .filter((reminder) => !reminder.completed)
    .sort((left, right) => left.nextDate.localeCompare(right.nextDate))
    .slice(0, 3);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <AppHeader
          subtitle={profile ? `${greeting}, ${profile.name}` : greeting}
          title="Hoje"
        />

        <AppCard style={styles.cycleCard}>
          {cycle.data?.cycleDay && cycle.data.phase ? (
            <View style={styles.cycleRow}>
              <View style={styles.cycleInfo}>
                <Text style={styles.muted}>
                  Dia {cycle.data.cycleDay} do ciclo
                </Text>
                <AppChip
                  label={`Fase ${phaseLabels[cycle.data.phase]}`}
                  tone={phaseTones[cycle.data.phase]}
                />
              </View>
              <View style={styles.nextPeriod}>
                <Text style={styles.days}>
                  {cycle.data.daysUntilNextPeriod}
                </Text>
                <Text style={styles.muted}>dias para a proxima</Text>
              </View>
            </View>
          ) : (
            <View style={styles.cycleInfo}>
              <Text style={styles.muted}>
                Registre duas menstruacoes para ver a previsao do seu ciclo.
              </Text>
              <AppButton
                onPress={() => navigation.navigate('MainTabs', { screen: 'Cycle' })}
                title="Registrar menstruacao"
                variant="ghost"
              />
            </View>
          )}
        </AppCard>
      </View>

      {cycle.error && <ErrorMessage compact message={cycle.error} />}

      <AppCard title="Sintomas de hoje">
        {symptoms.error ? (
          <Text style={styles.muted}>{symptoms.error}</Text>
        ) : todaySymptoms.length > 0 ? (
          <View style={styles.chipGroup}>
            {todaySymptoms.map((record) => (
              <AppChip
                key={record.id}
                label={`${record.symptom?.name ?? record.custom_symptom ?? 'Sintoma'} - ${describeIntensity(record.intensity)}`}
                tone="primary"
              />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>Nenhum sintoma registrado hoje.</Text>
        )}
        <AppButton
          onPress={() => navigation.navigate('Symptoms')}
          title="Registrar sintomas"
          variant="ghost"
        />
      </AppCard>

      <AppCard title="Proximos lembretes">
        {upcomingReminders.length > 0 ? (
          <View style={styles.list}>
            {upcomingReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminder}>
                <View>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.muted}>
                    {formatShortDate(reminder.nextDate)}
                    {reminder.recurring ? ` - ${reminder.recurrenceLabel}` : ''}
                  </Text>
                </View>
                <Text style={styles.reminderIcon}>{reminder.type}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>Nenhum lembrete pendente.</Text>
        )}
        <AppButton
          onPress={() => navigation.navigate('Reminders')}
          title="Ver todos os lembretes"
          variant="ghost"
        />
      </AppCard>

      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Dica de saude do dia</Text>
        <Text style={styles.tipText}>{cycle.data?.healthTip}</Text>
      </View>

      <MedicalDisclaimer />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  cycleCard: {
    marginTop: theme.spacing.md,
  },
  cycleInfo: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  cycleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  days: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.extraBold,
    textAlign: 'right',
  },
  hero: {
    backgroundColor: theme.colors.rosaLight,
    borderBottomLeftRadius: theme.radii.xxl,
    borderBottomRightRadius: theme.radii.xxl,
    marginHorizontal: -theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  list: {
    gap: theme.spacing.sm,
  },
  muted: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  nextPeriod: {
    alignItems: 'flex-end',
  },
  reminder: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  reminderIcon: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  reminderTitle: {
    color: theme.colors.secondaryForeground,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  screen: {
    paddingTop: 0,
  },
  tip: {
    backgroundColor: theme.colors.lilasLight,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  tipText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 22,
  },
  tipTitle: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});
