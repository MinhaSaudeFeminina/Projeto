import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CalendarDay, MonthCalendar as MonthCalendarData } from '../../services/cycleService';
import { theme } from '../../utils/theme';

export const monthNames = [
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

const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export type MonthCalendarProps = {
  monthDate: Date;
  calendar: MonthCalendarData | null;
  onChangeMonth: (offset: number) => void;
  onSelectDate?: (date: string) => void;
  selectedDate?: string | null;
};

export function MonthCalendar({
  monthDate,
  calendar,
  onChangeMonth,
  onSelectDate,
  selectedDate = null,
}: MonthCalendarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.monthNav}>
        <Pressable
          accessibilityLabel="Mes anterior"
          accessibilityRole="button"
          onPress={() => onChangeMonth(-1)}
          style={styles.navButton}
        >
          <Text style={styles.navText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
        </Text>
        <Pressable
          accessibilityLabel="Proximo mes"
          accessibilityRole="button"
          onPress={() => onChangeMonth(1)}
          style={styles.navButton}
        >
          <Text style={styles.navText}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekdayNames.map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: calendar?.leadingBlanks ?? 0 }).map((_, index) => (
          <View key={`blank-${index}`} style={styles.cell} />
        ))}
        {(calendar?.days ?? []).map((day) => (
          <DayCell
            day={day}
            key={day.date}
            onPress={onSelectDate}
            selected={day.date === selectedDate}
          />
        ))}
      </View>
    </View>
  );
}

export function CalendarLegend() {
  return (
    <View style={styles.legend}>
      <LegendItem label="Menstruacao" style={styles.periodDay} />
      <LegendItem label="Previsao" style={styles.predictedPeriodDay} />
      <LegendItem label="Periodo fertil" style={styles.fertileDay} />
      <LegendItem label="Ovulacao" style={styles.ovulationDay} />
      <View style={styles.legendItem}>
        <View style={styles.legendSymptom}>
          <View style={styles.symptomDot} />
        </View>
        <Text style={styles.legendLabel}>Registro do dia</Text>
      </View>
    </View>
  );
}

function DayCell({
  day,
  onPress,
  selected,
}: {
  day: CalendarDay;
  onPress?: (date: string) => void;
  selected: boolean;
}) {
  const dayNumber = Number(day.date.slice(8, 10));
  const filled = day.status === 'period';

  return (
    <Pressable
      accessibilityLabel={`${day.label}. ${statusLabels[day.status]}`}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={() => onPress?.(day.date)}
      style={[
        styles.cell,
        statusStyles[day.status],
        day.isToday && styles.today,
        selected && styles.selected,
      ]}
    >
      <Text style={[styles.dayText, filled && styles.filledDayText]}>
        {dayNumber}
      </Text>
      {day.hasSymptom && <View style={styles.symptomDot} />}
    </Pressable>
  );
}

function LegendItem({ label, style }: { label: string; style: object }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, style]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const statusLabels = {
  fertile: 'Periodo fertil',
  none: 'Sem marcacao',
  ovulation: 'Ovulacao',
  period: 'Menstruacao',
  predictedPeriod: 'Menstruacao prevista',
};

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: theme.radii.md,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: `${100 / 7 - 1}%`,
  },
  container: {
    gap: theme.spacing.sm,
  },
  dayText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
  },
  fertileDay: {
    backgroundColor: theme.colors.successLight,
  },
  filledDayText: {
    color: theme.colors.primaryDark,
    fontFamily: theme.typography.fonts.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  legend: {
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
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
  legendSwatch: {
    borderRadius: 6,
    height: 16,
    width: 16,
  },
  legendSymptom: {
    alignItems: 'center',
    height: 16,
    justifyContent: 'flex-end',
    width: 16,
  },
  monthNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthTitle: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
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
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.lg,
  },
  noneDay: {
    backgroundColor: 'transparent',
  },
  ovulationDay: {
    backgroundColor: theme.colors.warningLight,
  },
  // Recorded: solid fill. Predicted: outline only, so the two never read as
  // the same thing - they used to share one colour.
  periodDay: {
    backgroundColor: theme.colors.secondaryStrong,
  },
  predictedPeriodDay: {
    borderColor: theme.colors.rose,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  selected: {
    borderColor: theme.colors.primaryDark,
    borderStyle: 'solid',
  },
  symptomDot: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 3,
    bottom: 3,
    height: 6,
    position: 'absolute',
    width: 6,
  },
  today: {
    borderColor: theme.colors.primary,
    borderStyle: 'solid',
  },
  weekRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  weekday: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
    width: `${100 / 7 - 1}%`,
  },
});

const statusStyles = {
  fertile: styles.fertileDay,
  none: styles.noneDay,
  ovulation: styles.ovulationDay,
  period: styles.periodDay,
  predictedPeriod: styles.predictedPeriodDay,
};
