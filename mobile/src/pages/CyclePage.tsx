import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { AppScreen } from '../components/layout/AppScreen';
import { AppHeader } from '../components/layout/AppHeader';
import { useApiResource } from '../hooks/useApiResource';
import {
  buildMonthCalendar,
  getCycleSummary,
  registerPeriodStart,
  type CalendarDay,
} from '../services/cycleService';
import { getUserSymptomRecords } from '../services/symptomsService';
import { formatShortDate, toIsoDate } from '../utils/date';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function CyclePage() {
  const navigation = useNavigation<RootStackNavigation>();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cycle = useApiResource(getCycleSummary, []);
  const symptoms = useApiResource(getUserSymptomRecords, []);

  const firstWeekday = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(),
    [currentDate],
  );

  const symptomDates = useMemo(
    () => (symptoms.data ?? []).map((record) => record.occurred_on),
    [symptoms.data],
  );

  const calendarDays = useMemo(
    () =>
      cycle.data
        ? buildMonthCalendar(cycle.data, symptomDates, currentDate)
        : [],
    [cycle.data, symptomDates, currentDate],
  );

  const handleRegisterPeriod = async () => {
    setSaving(true);
    const result = await registerPeriodStart({ start_date: toIsoDate(new Date()) });
    setSaving(false);

    if (!result.ok) {
      setFeedback(result.error.message);
      return;
    }

    setFeedback('Menstruacao registrada!');
    cycle.reload();
  };

  if (cycle.loading) {
    return (
      <AppScreen>
        <AppHeader title="Ciclo Menstrual" />
        <LoadingState message="Carregando seu calendario." />
      </AppScreen>
    );
  }

  const summary = cycle.data;
  const stats = summary?.stats;

  function changeMonth(offset: number) {
    setCurrentDate(
      (date) => new Date(date.getFullYear(), date.getMonth() + offset, 1),
    );
  }

  return (
    <AppScreen>
      <AppHeader title="Ciclo Menstrual" />

      {cycle.error && <ErrorMessage compact message={cycle.error} />}

      <View style={styles.monthNav}>
        <Pressable
          accessibilityLabel="Mes anterior"
          accessibilityRole="button"
          onPress={() => changeMonth(-1)}
          style={styles.navButton}
        >
          <Text style={styles.navText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <Pressable
          accessibilityLabel="Proximo mes"
          accessibilityRole="button"
          onPress={() => changeMonth(1)}
          style={styles.navButton}
        >
          <Text style={styles.navText}>{'>'}</Text>
        </Pressable>
      </View>

      <AppCard>
        <View style={styles.weekRow}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {Array.from({ length: firstWeekday }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.dayCell} />
          ))}
          {calendarDays.map((day) => (
            <CalendarCell
              day={day}
              hasSymptom={symptomDates.includes(day.date)}
              key={day.date}
            />
          ))}
        </View>

        <View style={styles.legend}>
          <Legend color={theme.colors.rosaLight} label="Menstruacao" />
          <Legend color={theme.colors.fertileLight} label="Periodo fertil" />
          <Legend color={theme.colors.ovulationLight} label="Ovulacao" />
          <Legend color={theme.colors.lilas} label="Sintoma" />
        </View>
      </AppCard>

      <View style={styles.infoGrid}>
        <InfoCard
          label="Proxima menstruacao"
          value={
            summary?.daysUntilNextPeriod !== null &&
            summary?.daysUntilNextPeriod !== undefined
              ? `${summary.daysUntilNextPeriod} dias`
              : '--'
          }
        />
        <InfoCard
          label="Duracao media"
          value={stats?.averageCycleDays ? `${stats.averageCycleDays} dias` : '--'}
        />
        <InfoCard
          label="Ultima menstruacao"
          value={
            stats?.lastPeriodStart ? formatShortDate(stats.lastPeriodStart) : '--'
          }
        />
        <InfoCard
          label="Sintomas registrados"
          value={`${(symptoms.data ?? []).length}`}
        />
      </View>

      <AppButton
        fullWidth
        loading={saving}
        onPress={handleRegisterPeriod}
        size="lg"
        title="Registrar menstruacao hoje"
      />

      {/* Ciclo is a tab with nowhere to go back to, so the result is shown
          next to the button instead of at the top of a long screen. */}
      {feedback && (
        <FeedbackMessage
          message={feedback}
          onDismiss={() => setFeedback(null)}
          variant={feedback === 'Menstruacao registrada!' ? 'success' : 'warning'}
        />
      )}

      <AppButton
        fullWidth
        onPress={() => navigation.navigate('Symptoms')}
        title="Registrar sintomas"
        variant="secondary"
      />

      <MedicalDisclaimer compact />
    </AppScreen>
  );
}

function CalendarCell({
  day,
  hasSymptom,
}: {
  day: CalendarDay;
  hasSymptom: boolean;
}) {
  const date = new Date(`${day.date}T00:00:00`);
  const dayNumber = date.getDate();
  const statusStyle = calendarStatusStyles[day.status] ?? styles.noneDay;

  return (
    <View style={[styles.dayCell, statusStyle]}>
      <Text
        style={[styles.dayText, day.status !== 'none' && styles.markedDayText]}
      >
        {dayNumber}
      </Text>
      {hasSymptom && <View style={styles.symptomDot} />}
    </View>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.infoCard}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </AppCard>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: theme.radii.md,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: `${100 / 7 - 1}%`,
  },
  dayText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
  },
  fertileDay: {
    backgroundColor: theme.colors.fertileLight,
  },
  infoCard: {
    flexBasis: '48%',
    padding: theme.spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  infoLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
  },
  infoValue: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extraBold,
  },
  legend: {
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  legendDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  legendLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
  },
  markedDayText: {
    fontWeight: theme.typography.weights.bold,
  },
  monthNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthTitle: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.extraBold,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radii.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  navText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  noneDay: {
    backgroundColor: 'transparent',
  },
  ovulationDay: {
    backgroundColor: theme.colors.ovulationLight,
  },
  periodDay: {
    backgroundColor: theme.colors.rosaLight,
  },
  predictedPeriodDay: {
    backgroundColor: theme.colors.rosaLight,
  },
  symptomDay: {
    backgroundColor: theme.colors.lilasLight,
  },
  symptomDot: {
    backgroundColor: theme.colors.lilas,
    borderRadius: 3,
    bottom: 3,
    height: 6,
    position: 'absolute',
    width: 6,
  },
  weekRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  weekday: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    width: `${100 / 7 - 1}%`,
  },
});

const calendarStatusStyles = {
  fertile: styles.fertileDay,
  none: styles.noneDay,
  ovulation: styles.ovulationDay,
  period: styles.periodDay,
  predictedPeriod: styles.predictedPeriodDay,
  symptom: styles.symptomDay,
};
