import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { AppScreen } from '../components/layout/AppScreen';
import { AppHeader } from '../components/layout/AppHeader';
import { getCycleSummary } from '../services/cycleService';
import { getUserReminders } from '../services/remindersService';
import { getSymptomOptions, getUserSymptoms } from '../services/symptomsService';
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
  const today = useMemo(() => new Date(), []);
  const todayIsoDate = toIsoDate(today);

  const cycleResult = getCycleSummary(today);
  const symptomsResult = getUserSymptoms();
  const symptomOptionsResult = getSymptomOptions();
  const remindersResult = getUserReminders();

  if (
    !cycleResult.ok ||
    !symptomsResult.ok ||
    !symptomOptionsResult.ok ||
    !remindersResult.ok
  ) {
    return (
      <AppScreen>
        <ErrorMessage message="Nao foi possivel carregar o resumo de hoje." />
      </AppScreen>
    );
  }

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const todaySymptoms = symptomsResult.data.filter(
    (symptom) => symptom.date === todayIsoDate,
  );
  const upcomingReminders = remindersResult.data
    .filter((reminder) => !reminder.completed)
    .slice(0, 3);
  const cycle = cycleResult.data;
  const symptomOptions = symptomOptionsResult.data;

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <AppHeader
          subtitle={`${greeting}, ${cycle.user.name}`}
          title="Hoje"
        />

        <AppCard style={styles.cycleCard}>
          <View style={styles.cycleRow}>
            <View style={styles.cycleInfo}>
              <Text style={styles.muted}>Dia {cycle.cycleDay} do ciclo</Text>
              <AppChip
                label={`Fase ${phaseLabels[cycle.phase]}`}
                tone={phaseTones[cycle.phase]}
              />
            </View>
            <View style={styles.nextPeriod}>
              <Text style={styles.days}>{cycle.daysUntilNextPeriod}</Text>
              <Text style={styles.muted}>dias para a proxima</Text>
            </View>
          </View>
        </AppCard>
      </View>

      <AppCard title="Sintomas de hoje">
        {todaySymptoms.length > 0 ? (
          <View style={styles.chipGroup}>
            {todaySymptoms.map((symptom) => {
              const symptomType = symptomOptions.find(
                (type) => type.id === symptom.type,
              );

              return (
                <AppChip
                  icon={<Text>{symptomType?.icon}</Text>}
                  key={symptom.id}
                  label={`${symptomType?.label ?? symptom.type} - ${symptom.intensity}`}
                  tone="primary"
                />
              );
            })}
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
                  <Text style={styles.muted}>{formatShortDate(reminder.date)}</Text>
                </View>
                <Text style={styles.reminderIcon}>cal</Text>
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
        <Text style={styles.tipText}>{cycle.healthTip}</Text>
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
