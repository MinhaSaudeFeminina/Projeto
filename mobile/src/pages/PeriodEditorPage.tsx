import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppTextInput } from '../components/ui/AppTextInput';
import { AppToggle } from '../components/ui/AppToggle';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { useApiResource } from '../hooks/useApiResource';
import {
  deletePeriodById,
  getPeriod,
  savePeriod,
} from '../services/cycleService';
import { brDateToIso, formatBrDate, maskBrDate } from '../utils/date';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type PeriodEditorPageProps = RootStackScreenProps<'PeriodEditor'>;

export function PeriodEditorPage({ navigation, route }: PeriodEditorPageProps) {
  const periodId = route.params?.periodId ?? null;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ongoing, setOngoing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const existing = useApiResource(
    () => (periodId === null ? Promise.resolve(emptyPeriod) : getPeriod(periodId)),
    [periodId],
  );
  const handleBack = () => navigateBackOrToday(navigation);

  useEffect(() => {
    const period = existing.data;

    if (!period) {
      return;
    }

    setStartDate(formatBrDate(period.start_date));
    setEndDate(period.end_date ? formatBrDate(period.end_date) : '');
    setOngoing(period.end_date === null);
  }, [existing.data]);

  if (periodId !== null && existing.loading) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Editar menstruacao" />
        <LoadingState message="Carregando a menstruacao." />
      </AppScreen>
    );
  }

  const handleSave = async () => {
    const start = brDateToIso(startDate);

    if (!start) {
      setError('Informe o inicio no formato DD/MM/AAAA.');
      return;
    }

    let end: string | null = null;

    if (!ongoing) {
      end = brDateToIso(endDate);

      if (!end) {
        setError('Informe o termino no formato DD/MM/AAAA.');
        return;
      }
    }

    setSaving(true);
    const result = await savePeriod({ endDate: end, id: periodId, startDate: start });
    setSaving(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    if (result.data.warning) {
      setError(result.data.warning);
      return;
    }

    handleBack();
  };

  const confirmDelete = () => {
    if (periodId === null) {
      return;
    }

    Alert.alert(
      'Apagar menstruacao',
      'Isso remove esse registro e recalcula suas previsoes. Nao da para desfazer.',
      [
        { style: 'cancel', text: 'Cancelar' },
        {
          onPress: () => {
            void handleDelete(periodId);
          },
          style: 'destructive',
          text: 'Apagar',
        },
      ],
    );
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    const result = await deletePeriodById(id);
    setSaving(false);

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
        subtitle={
          periodId === null
            ? 'Registre uma menstruacao que ja passou para melhorar suas previsoes'
            : 'Ajuste as datas dessa menstruacao'
        }
        title={periodId === null ? 'Adicionar menstruacao' : 'Editar menstruacao'}
      />

      {error && (
        <FeedbackMessage
          message={error}
          onDismiss={() => setError(null)}
          variant="warning"
        />
      )}

      <AppCard>
        <AppTextInput
          keyboardType="number-pad"
          label="Comecou em"
          onChangeText={(value) => setStartDate(maskBrDate(value))}
          placeholder="DD/MM/AAAA"
          value={startDate}
        />

        <AppToggle
          description="Deixe ligado se a menstruacao ainda nao terminou."
          label="Ainda estou menstruada"
          onValueChange={setOngoing}
          value={ongoing}
        />

        {!ongoing && (
          <AppTextInput
            keyboardType="number-pad"
            label="Terminou em"
            onChangeText={(value) => setEndDate(maskBrDate(value))}
            placeholder="DD/MM/AAAA"
            value={endDate}
          />
        )}
      </AppCard>

      <AppButton
        fullWidth
        loading={saving}
        onPress={handleSave}
        size="lg"
        title="Salvar"
      />

      {periodId !== null && (
        <AppButton
          fullWidth
          onPress={confirmDelete}
          title="Apagar essa menstruacao"
          variant="danger"
        />
      )}

      <View style={styles.hint}>
        <Text style={styles.hintText}>
          Duas menstruacoes registradas ja bastam para o app calcular a duracao
          media do seu ciclo. Quanto mais voce registrar, melhor fica a previsao.
        </Text>
      </View>
    </AppScreen>
  );
}

const emptyPeriod = { data: null, ok: true } as const;

const styles = StyleSheet.create({
  hint: {
    backgroundColor: theme.colors.peachLight,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  hintText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 22,
  },
});
