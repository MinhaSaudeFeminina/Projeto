import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { useApiResource } from '../hooks/useApiResource';
import { getCycleHistory, type CycleHistoryEntry } from '../services/cycleService';
import { formatShortDate } from '../utils/date';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type CycleHistoryPageProps = RootStackScreenProps<'CycleHistory'>;

export function CycleHistoryPage({ navigation }: CycleHistoryPageProps) {
  const history = useApiResource(getCycleHistory, []);
  const handleBack = () => navigateBackOrToday(navigation);
  const openEditor = (periodId?: number) =>
    navigation.navigate('PeriodEditor', periodId ? { periodId } : undefined);

  if (history.loading) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Historico de ciclos" />
        <LoadingState message="Carregando seus ciclos." />
      </AppScreen>
    );
  }

  const entries = history.data ?? [];

  return (
    <AppScreen>
      <AppHeader
        onBack={handleBack}
        subtitle="Toque em uma menstruacao para corrigir as datas"
        title="Historico de ciclos"
      />

      {history.error && <ErrorMessage compact message={history.error} />}

      {entries.length === 0 ? (
        <EmptyState
          action={
            <AppButton
              onPress={() => openEditor()}
              title="Adicionar menstruacao"
            />
          }
          message="Registre as menstruacoes que voce lembra para o app comecar a prever as proximas."
          title="Nenhuma menstruacao registrada"
        />
      ) : (
        <View style={styles.list}>
          {entries.map((entry) => (
            <HistoryCard entry={entry} key={entry.id} onPress={openEditor} />
          ))}
        </View>
      )}

      <AppButton
        fullWidth
        onPress={() => openEditor()}
        title="Adicionar menstruacao anterior"
        variant="secondary"
      />
    </AppScreen>
  );
}

function HistoryCard({
  entry,
  onPress,
}: {
  entry: CycleHistoryEntry;
  onPress: (periodId: number) => void;
}) {
  const range = entry.endDate
    ? `${formatShortDate(entry.startDate)} a ${formatShortDate(entry.endDate)}`
    : `Desde ${formatShortDate(entry.startDate)}`;

  return (
    <AppCard contentStyle={styles.card}>
      <View style={styles.row}>
        <Text style={styles.range}>{range}</Text>
        {entry.ongoing && <AppChip label="Em andamento" tone="primary" />}
      </View>

      <Text style={styles.detail}>
        {entry.periodDays === null
          ? 'Duracao ainda em aberto'
          : `${entry.periodDays} dias de menstruacao`}
        {entry.cycleDays === null ? '' : ` - ciclo de ${entry.cycleDays} dias`}
      </Text>

      <AppButton
        onPress={() => onPress(entry.id)}
        size="sm"
        title="Editar"
        variant="ghost"
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.sm,
  },
  detail: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
  },
  list: {
    gap: theme.spacing.md,
  },
  range: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
});
