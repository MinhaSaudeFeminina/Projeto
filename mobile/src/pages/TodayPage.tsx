import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { phaseLabels, phaseTones } from '../components/cycle/phase';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { AppScreen } from '../components/layout/AppScreen';
import { ScreenHero } from '../components/layout/ScreenHero';
import { AppHeader } from '../components/layout/AppHeader';
import { useAppContext } from '../context/AppContext';
import { useApiResource } from '../hooks/useApiResource';
import { getCycleSummary } from '../services/cycleService';
import { getDayLogDetail } from '../services/dayLogService';
import { getUserReminders } from '../services/remindersService';
import { formatShortDate, todayIso } from '../utils/date';
import { flowLabels, moodLabels } from '../utils/period';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

export function TodayPage() {
  const navigation = useNavigation<RootStackNavigation>();
  const { profile } = useAppContext();
  const today = useMemo(() => new Date(), []);
  const todayIsoDate = todayIso();

  const cycle = useApiResource(() => getCycleSummary(today), [todayIsoDate]);
  const dayLog = useApiResource(() => getDayLogDetail(todayIsoDate), [todayIsoDate]);
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
  const position = cycle.data?.position ?? null;
  const draft = dayLog.data?.draft ?? null;
  const catalog = dayLog.data?.catalog ?? [];
  // A repeating reminder always has a next occurrence, so insertion order is not
  // enough: the card shows the closest dates.
  const upcomingReminders = (reminders.data ?? [])
    .filter((reminder) => !reminder.completed)
    .sort((left, right) => left.nextDate.localeCompare(right.nextDate))
    .slice(0, 3);

  const openDayLog = () => navigation.navigate('DayLog', { date: todayIsoDate });

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <ScreenHero>
        <AppHeader
          subtitle={profile ? `${greeting}, ${profile.name}` : greeting}
          title="Hoje"
        />

        <AppCard style={styles.cycleCard}>
          {position === null ? (
            <View style={styles.cycleInfo}>
              <Text style={styles.muted}>
                Registre sua menstruacao para acompanhar seu ciclo aqui.
              </Text>
              <AppButton
                onPress={() => navigation.navigate('MainTabs', { screen: 'Cycle' })}
                title="Registrar menstruacao"
                variant="ghost"
              />
            </View>
          ) : position.isLate ? (
            <View style={styles.cycleInfo}>
              <Text style={styles.lateTitle}>
                Menstruacao atrasada ha {position.lateDays}{' '}
                {position.lateDays === 1 ? 'dia' : 'dias'}
              </Text>
              <Text style={styles.muted}>
                Ciclos variam. Registre assim que ela chegar para o app se
                ajustar.
              </Text>
            </View>
          ) : (
            <View style={styles.cycleRow}>
              <View style={styles.cycleInfo}>
                <Text style={styles.muted}>Dia {position.cycleDay} do ciclo</Text>
                <AppChip
                  label={`Fase ${phaseLabels[position.phase]}`}
                  tone={phaseTones[position.phase]}
                />
              </View>
              <View style={styles.nextPeriod}>
                <Text style={styles.days}>{position.daysUntilNextPeriod}</Text>
                <Text style={styles.muted}>
                  {position.estimated ? 'dias (estimativa)' : 'dias para a proxima'}
                </Text>
              </View>
            </View>
          )}
        </AppCard>
      </ScreenHero>

      {cycle.error && <ErrorMessage compact message={cycle.error} />}

      <AppCard title="Registro de hoje">
        {dayLog.error ? (
          <Text style={styles.muted}>{dayLog.error}</Text>
        ) : draft && hasEntries(draft) ? (
          <View style={styles.chipGroup}>
            {draft.flow && (
              <AppChip label={`Fluxo ${flowLabels[draft.flow]}`} tone="primary" />
            )}
            {draft.mood && (
              <AppChip label={moodLabels[draft.mood]} tone="peach" />
            )}
            {draft.symptoms.map((symptom) => (
              <AppChip
                key={symptom.key}
                label={
                  catalog.find((option) => option.key === symptom.key)?.name ??
                  'Sintoma'
                }
                tone="rose"
              />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>Nada registrado hoje ainda.</Text>
        )}
        <AppButton onPress={openDayLog} title="Registrar meu dia" variant="ghost" />
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

function hasEntries(draft: { flow: unknown; mood: unknown; symptoms: unknown[] }) {
  return Boolean(draft.flow) || Boolean(draft.mood) || draft.symptoms.length > 0;
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
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.xxl,
    textAlign: 'right',
  },
  lateTitle: {
    color: theme.colors.warningForeground,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
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
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xs,
  },
  reminderTitle: {
    color: theme.colors.secondaryForeground,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
  },
  screen: {
    paddingTop: 0,
  },
  tip: {
    backgroundColor: theme.colors.peachLight,
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
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
  },
});
