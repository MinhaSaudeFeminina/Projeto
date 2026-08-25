import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { AppScreen } from '../components/layout/AppScreen';
import { AppHeader } from '../components/layout/AppHeader';
import {
  getCycleSummary,
  getMonthCalendarDays,
  type CalendarDay,
} from '../services/cycleService';
import { getUserSymptoms } from '../services/symptomsService';
import { formatShortDate } from '../utils/date';
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
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 2, 1));

  const summaryResult = getCycleSummary();
  const calendarResult = getMonthCalendarDays(currentDate);
  const symptomsResult = getUserSymptoms();

  const firstWeekday = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(),
    [currentDate],
  );

  if (!summaryResult.ok || !calendarResult.ok || !symptomsResult.ok) {
    return (
      <AppScreen>
        <ErrorMessage message="Nao foi possivel carregar o calendario menstrual." />
      </AppScreen>
    );
  }

  const summary = summaryResult.data;
  const calendarDays = calendarResult.data;

  function changeMonth(offset: number) {
    setCurrentDate(
      (date) => new Date(date.getFullYear(), date.getMonth() + offset, 1),
    );
  }

  return (
    <AppScreen>
      <AppHeader title="Ciclo Menstrual" />

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
            <CalendarCell day={day} key={day.date} />
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
          value={`${summary.daysUntilNextPeriod} dias`}
        />
        <InfoCard
          label="Duracao media"
          value={`${summary.user.cycleAverageDays} dias`}
        />
        <InfoCard
          label="Ultima menstruacao"
          value={formatShortDate(summary.user.lastPeriodDate)}
        />
        <InfoCard
          label="Sintomas registrados"
          value={`${symptomsResult.data.length}`}
        />
      </View>

      <AppButton
        fullWidth
        onPress={() => navigation.navigate('Symptoms')}
        title="Registrar sintomas"
      />

      <MedicalDisclaimer compact />
    </AppScreen>
  );
}

function CalendarCell({ day }: { day: CalendarDay }) {
  const date = new Date(`${day.date}T00:00:00`);
  const dayNumber = date.getDate();
  const statusStyle = calendarStatusStyles[day.status] ?? styles.noneDay;

  return (
    <View style={[styles.dayCell, statusStyle]}>
      <Text style={[styles.dayText, day.status !== 'none' && styles.markedDayText]}>
        {dayNumber}
      </Text>
      {day.symptoms.length > 0 && <View style={styles.symptomDot} />}
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
