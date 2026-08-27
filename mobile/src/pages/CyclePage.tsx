import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { CalendarLegend, MonthCalendar } from '../components/cycle/MonthCalendar';
import { CycleRing } from '../components/cycle/CycleRing';
import { phaseLabels, phaseTones } from '../components/cycle/phase';
import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { ScreenHero } from '../components/layout/ScreenHero';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { useApiResource } from '../hooks/useApiResource';
import {
  endPeriodToday,
  getCycleSummary,
  getMonthCalendar,
  isTodayInPeriod,
  shiftOngoingPeriodStart,
  startPeriodToday,
  type CyclePosition,
  type CycleSummary,
} from '../services/cycleService';
import { formatShortDate, todayIso } from '../utils/date';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

export function CyclePage() {
  const navigation = useNavigation<RootStackNavigation>();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const summary = useApiResource(getCycleSummary, []);
  const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
  const calendar = useApiResource(() => getMonthCalendar(monthDate), [monthKey]);

  const changeMonth = (offset: number) =>
    setMonthDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );

  const runAction = async (action: () => ReturnType<typeof startPeriodToday>) => {
    setSaving(true);
    const result = await action();
    setSaving(false);

    setFeedback(result.ok ? null : result.error.message);
    summary.reload();
    calendar.reload();
  };

  if (summary.loading) {
    return (
      <AppScreen>
        <AppHeader title="Ciclo" />
        <LoadingState message="Carregando seu calendario." />
      </AppScreen>
    );
  }

  const data = summary.data;

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <ScreenHero>
        <AppHeader
          subtitle="Seus registros ficam neste aparelho"
          title="Ciclo"
        />
        {data && <CycleHero summary={data} />}
      </ScreenHero>

      {summary.error && <ErrorMessage compact message={summary.error} />}

      {feedback && (
        <FeedbackMessage
          message={feedback}
          onDismiss={() => setFeedback(null)}
          variant="warning"
        />
      )}

      {data?.ongoingPeriod ? (
        <View style={styles.actions}>
          <AppButton
            fullWidth
            loading={saving}
            onPress={() => runAction(endPeriodToday)}
            size="lg"
            title="Minha menstruacao terminou"
          />
          <AppButton
            onPress={() => runAction(() => shiftOngoingPeriodStart(-1))}
            size="sm"
            title="Na verdade comecou um dia antes"
            variant="ghost"
          />
        </View>
      ) : (
        // Hidden when today already belongs to a menstruation: pressing it
        // could only ever produce an "ja existe" error.
        data &&
        !isTodayInPeriod(data.cycles) && (
          <AppButton
            fullWidth
            loading={saving}
            onPress={() => runAction(startPeriodToday)}
            size="lg"
            title="Minha menstruacao comecou hoje"
          />
        )
      )}

      <AppCard>
        <MonthCalendar
          calendar={calendar.data}
          monthDate={monthDate}
          onChangeMonth={changeMonth}
          onSelectDate={(date) => navigation.navigate('DayLog', { date })}
        />
        <CalendarLegend />
      </AppCard>

      {calendar.error && <ErrorMessage compact message={calendar.error} />}

      {data && data.stats.cyclesRecorded === 0 ? (
        <EmptyState
          action={
            <AppButton
              onPress={() => navigation.navigate('PeriodEditor')}
              title="Registrar uma menstruacao anterior"
            />
          }
          message="Assim que voce registrar sua primeira menstruacao o app comeca a mostrar a previsao das proximas."
          title="Ainda nao ha nada por aqui"
        />
      ) : (
        data && <CycleStatsGrid summary={data} />
      )}

      <AppButton
        fullWidth
        onPress={() => navigation.navigate('CycleHistory')}
        title="Historico de ciclos"
        variant="secondary"
      />
      <AppButton
        fullWidth
        onPress={() => navigation.navigate('DayLog', { date: todayIso() })}
        title="Registrar meu dia"
        variant="secondary"
      />

      <MedicalDisclaimer compact />
    </AppScreen>
  );
}

function CycleHero({ summary }: { summary: CycleSummary }) {
  const { position, stats } = summary;

  if (!position) {
    return (
      <AppCard style={styles.heroCard}>
        <Text style={styles.muted}>
          Registre sua menstruacao para acompanhar o ciclo e ver a previsao das
          proximas.
        </Text>
      </AppCard>
    );
  }

  // A late period is its own state. Counting on past the average and wrapping
  // around used to report "dia 8" to someone eight days late.
  if (position.isLate) {
    return (
      <AppCard style={styles.heroCard}>
        <View style={styles.heroRow}>
          <CycleRing
            caption={position.lateDays === 1 ? 'dia de atraso' : 'dias de atraso'}
            tone="warning"
            value={`${position.lateDays}`}
          />
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>Menstruacao atrasada</Text>
            <Text style={styles.muted}>
              Ciclos variam bastante. Se o atraso te preocupa, converse com uma
              profissional de saude.
            </Text>
            {stats.lastPeriodStart && (
              <Text style={styles.muted}>
                Ultima menstruacao em {formatShortDate(stats.lastPeriodStart)}.
              </Text>
            )}
          </View>
        </View>
      </AppCard>
    );
  }

  return (
    <AppCard style={styles.heroCard}>
      <View style={styles.heroRow}>
        <CycleRing
          caption="do ciclo"
          label={position.estimated ? 'Estimativa' : undefined}
          value={`Dia ${position.cycleDay}`}
        />
        <View style={styles.heroInfo}>
          <AppChip
            label={`Fase ${phaseLabels[position.phase]}`}
            tone={phaseTones[position.phase]}
          />
          {position.periodDay !== null && (
            <Text style={styles.heroTitle}>
              Dia {position.periodDay} da menstruacao
            </Text>
          )}
          <Text style={styles.muted}>{describeNextPeriod(position)}</Text>
        </View>
      </View>
    </AppCard>
  );
}

function describeNextPeriod(position: CyclePosition) {
  if (position.daysUntilNextPeriod === 0) {
    return 'A proxima menstruacao pode comecar hoje';
  }

  if (position.daysUntilNextPeriod === 1) {
    return 'A proxima menstruacao pode comecar amanha';
  }

  return `Faltam ${position.daysUntilNextPeriod} dias para a proxima`;
}

function CycleStatsGrid({ summary }: { summary: CycleSummary }) {
  const { stats, position } = summary;
  const sample = useMemo(
    () =>
      stats.cyclesRecorded === 1
        ? '1 ciclo registrado'
        : `${stats.cyclesRecorded} ciclos registrados`,
    [stats.cyclesRecorded],
  );

  return (
    <View style={styles.statsGrid}>
      <StatCard
        label="Proxima menstruacao"
        value={
          position && !position.isLate
            ? `${position.daysUntilNextPeriod} dias`
            : 'Atrasada'
        }
      />
      <StatCard
        label={stats.averageCycleDays ? sample : 'Sem media ainda'}
        value={stats.averageCycleDays ? `${stats.averageCycleDays} dias` : '--'}
      />
      <StatCard
        label="Duracao da menstruacao"
        value={stats.averagePeriodDays ? `${stats.averagePeriodDays} dias` : '--'}
      />
      <StatCard label="Regularidade" value={stats.regularity} />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: theme.spacing.xs,
  },
  heroCard: {
    marginTop: theme.spacing.md,
  },
  heroInfo: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  heroTitle: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
  },
  muted: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  screen: {
    paddingTop: 0,
  },
  statCard: {
    flexBasis: '48%',
    padding: theme.spacing.md,
  },
  statLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
  },
  statValue: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
});
