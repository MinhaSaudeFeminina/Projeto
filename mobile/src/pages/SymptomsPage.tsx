import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { useApiResource } from '../hooks/useApiResource';
import {
  getSymptomCatalog,
  registerSymptoms,
  symptomIntensities,
  togglePendingSymptom,
  updatePendingSymptomIntensity,
  type PendingSymptomEntry,
} from '../services/symptomsService';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type SymptomsPageProps = RootStackScreenProps<'Symptoms'>;

type Feedback = {
  message: string;
  variant: 'success' | 'warning';
};

export function SymptomsPage({ navigation }: SymptomsPageProps) {
  const [selected, setSelected] = useState<PendingSymptomEntry[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saving, setSaving] = useState(false);
  const catalog = useApiResource(getSymptomCatalog, []);
  const handleBack = () => navigateBackOrToday(navigation);

  if (catalog.loading) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Registrar sintomas" />
        <LoadingState message="Carregando a lista de sintomas." />
      </AppScreen>
    );
  }

  if (!catalog.data) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Registrar sintomas" />
        <ErrorMessage
          action={<AppButton onPress={catalog.reload} title="Tentar novamente" />}
          message={catalog.error ?? 'Nao foi possivel carregar a lista de sintomas.'}
        />
      </AppScreen>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const result = await registerSymptoms(selected);
    setSaving(false);

    if (!result.ok) {
      setFeedback({ message: result.error.message, variant: 'warning' });
      return;
    }

    if (result.data.guidance) {
      // A health alert has to be read, so the screen stays put to show it.
      setFeedback({ message: result.data.guidance, variant: 'warning' });
      setSelected([]);
      return;
    }

    // The screen that sent the user here lists the records and reloads on
    // focus, so it doubles as the confirmation.
    handleBack();
  };

  return (
    <AppScreen>
      <AppHeader
        onBack={handleBack}
        subtitle="Selecione os sintomas que esta sentindo hoje"
        title="Registrar sintomas"
      />

      {feedback && (
        <FeedbackMessage
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          variant={feedback.variant}
        />
      )}

      <View style={styles.list}>
        {catalog.data.map((symptom) => {
          const selectedEntry = selected.find(
            (entry) => entry.symptomId === symptom.id,
          );

          return (
            <AppCard
              key={symptom.id}
              contentStyle={styles.symptomContent}
              style={selectedEntry && styles.selectedCard}
            >
              <AppButton
                onPress={() =>
                  setSelected((current) =>
                    togglePendingSymptom(current, symptom.id),
                  )
                }
                title={symptom.name}
                variant={selectedEntry ? 'primary' : 'secondary'}
              />

              {selectedEntry && (
                <View style={styles.intensityBlock}>
                  <Text style={styles.intensityLabel}>Intensidade</Text>
                  <View style={styles.intensityOptions}>
                    {symptomIntensities.map((level) => (
                      <AppChip
                        key={level}
                        label={level}
                        onPress={() =>
                          setSelected((current) =>
                            updatePendingSymptomIntensity(
                              current,
                              symptom.id,
                              level,
                            ),
                          )
                        }
                        selected={selectedEntry.intensity === level}
                        tone="primary"
                      />
                    ))}
                  </View>
                </View>
              )}
            </AppCard>
          );
        })}
      </View>

      {selected.length > 0 && (
        <AppButton
          fullWidth
          loading={saving}
          onPress={handleSave}
          size="lg"
          title={`Salvar ${selected.length} sintoma(s)`}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intensityBlock: {
    gap: theme.spacing.sm,
  },
  intensityLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
  },
  intensityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.md,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
  },
  symptomContent: {
    gap: theme.spacing.md,
  },
});
