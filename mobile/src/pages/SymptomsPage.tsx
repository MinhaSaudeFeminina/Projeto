import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import {
  getSymptomOptions,
  getSymptomSuccessMessage,
  registerSymptoms,
  togglePendingSymptom,
  updatePendingSymptomIntensity,
  type PendingSymptomEntry,
} from '../services/symptomsService';
import type { SymptomIntensity } from '../data/mockData';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type SymptomsPageProps = RootStackScreenProps<'Symptoms'>;

const intensityOptions: SymptomIntensity[] = ['leve', 'moderado', 'intenso'];

export function SymptomsPage({ navigation }: SymptomsPageProps) {
  const [selected, setSelected] = useState<PendingSymptomEntry[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const symptomOptionsResult = getSymptomOptions();
  const handleBack = () => navigateBackOrToday(navigation);

  if (!symptomOptionsResult.ok) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Registrar sintomas" />
        <ErrorMessage message="Nao foi possivel carregar a lista de sintomas." />
      </AppScreen>
    );
  }

  const handleSave = () => {
    const result = registerSymptoms(selected);

    if (!result.ok) {
      setFeedback('Nao foi possivel registrar os sintomas.');
      return;
    }

    const message = getSymptomSuccessMessage(selected.length);
    setFeedback(message.ok ? message.data : 'Sintomas registrados!');
    setSelected([]);
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
          message={feedback}
          onDismiss={() => setFeedback(null)}
          variant={feedback.startsWith('Nao') ? 'warning' : 'success'}
        />
      )}

      <View style={styles.list}>
        {symptomOptionsResult.data.map((symptom) => {
          const selectedEntry = selected.find(
            (entry) => entry.type === symptom.id,
          );

          return (
            <AppCard
              key={symptom.id}
              contentStyle={styles.symptomContent}
              style={selectedEntry && styles.selectedCard}
            >
              <AppButton
                icon={<Text style={styles.symptomIcon}>{symptom.icon}</Text>}
                onPress={() =>
                  setSelected((current) =>
                    togglePendingSymptom(current, symptom.id),
                  )
                }
                title={symptom.label}
                variant={selectedEntry ? 'primary' : 'secondary'}
              />

              {selectedEntry && (
                <View style={styles.intensityBlock}>
                  <Text style={styles.intensityLabel}>Intensidade</Text>
                  <View style={styles.intensityOptions}>
                    {intensityOptions.map((level) => (
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
  symptomIcon: {
    fontSize: theme.typography.sizes.md,
  },
});
