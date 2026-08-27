import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { AppTextInput } from '../components/ui/AppTextInput';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { useApiResource } from '../hooks/useApiResource';
import {
  deleteDayLogForDate,
  getDayLogDetail,
  saveDayLog,
  type DayLogDraft,
} from '../services/dayLogService';
import {
  addCustomSymptom,
  groupSymptoms,
  type SymptomOption,
} from '../services/symptomsService';
import { addDaysIso, formatLongDate, todayIso } from '../utils/date';
import { navigateBackOrToday } from '../utils/navigation';
import {
  flowLabels,
  flowLevels,
  isBleeding,
  moodLabels,
  moodLevels,
  symptomIntensities,
  type FlowLevel,
  type MoodLevel,
  type SymptomIntensity,
} from '../utils/period';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type DayLogPageProps = RootStackScreenProps<'DayLog'>;

type Feedback = {
  message: string;
  variant: 'success' | 'warning';
};

export function DayLogPage({ navigation, route }: DayLogPageProps) {
  const { focus, symptomKey } = route.params;
  const [date, setDate] = useState(route.params.date);
  const [draft, setDraft] = useState<DayLogDraft | null>(null);
  const [catalog, setCatalog] = useState<SymptomOption[]>([]);
  const [customName, setCustomName] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saving, setSaving] = useState(false);

  const detail = useApiResource(() => getDayLogDetail(date), [date]);
  const handleBack = () => navigateBackOrToday(navigation);

  useEffect(() => {
    if (!detail.data) {
      return;
    }

    setCatalog(detail.data.catalog);
    setDraft({
      ...detail.data.draft,
      // A quick action that names a symptom pre-selects it, so "Registrar
      // colica" lands on a screen that already has colica ticked.
      symptoms: symptomKey
        ? withSymptom(detail.data.draft.symptoms, symptomKey)
        : detail.data.draft.symptoms,
    });
  }, [detail.data, symptomKey]);

  const groups = useMemo(() => groupSymptoms(catalog), [catalog]);
  const isToday = date === todayIso();

  if (detail.loading || !draft) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Registro do dia" />
        {detail.error ? (
          <ErrorMessage
            action={<AppButton onPress={detail.reload} title="Tentar novamente" />}
            message={detail.error}
          />
        ) : (
          <LoadingState message="Carregando seu registro." />
        )}
      </AppScreen>
    );
  }

  const update = (changes: Partial<DayLogDraft>) =>
    setDraft((current) => (current ? { ...current, ...changes } : current));

  const toggleSymptom = (key: string) =>
    update({
      symptoms: draft.symptoms.some((symptom) => symptom.key === key)
        ? draft.symptoms.filter((symptom) => symptom.key !== key)
        : [...draft.symptoms, { intensity: null, key }],
    });

  const setIntensity = (key: string, intensity: SymptomIntensity) =>
    update({
      symptoms: draft.symptoms.map((symptom) =>
        symptom.key === key
          ? { ...symptom, intensity: symptom.intensity === intensity ? null : intensity }
          : symptom,
      ),
    });

  const handleAddCustom = async () => {
    const result = await addCustomSymptom(customName);

    if (!result.ok) {
      setFeedback({ message: result.error.message, variant: 'warning' });
      return;
    }

    setCatalog((current) =>
      current.some((symptom) => symptom.key === result.data.key)
        ? current
        : [...current, result.data],
    );
    update({ symptoms: withSymptom(draft.symptoms, result.data.key) });
    setCustomName('');
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveDayLog(draft, catalog);
    setSaving(false);

    if (!result.ok) {
      setFeedback({ message: result.error.message, variant: 'warning' });
      return;
    }

    // Guidance has to be read, so the screen stays put for it. Everything else
    // is confirmed by the calendar the user goes back to.
    if (result.data.guidance) {
      setFeedback({ message: result.data.guidance, variant: 'warning' });
      detail.reload();
      return;
    }

    handleBack();
  };

  const handleDelete = async () => {
    setSaving(true);
    const result = await deleteDayLogForDate(date);
    setSaving(false);

    if (!result.ok) {
      setFeedback({ message: result.error.message, variant: 'warning' });
      return;
    }

    handleBack();
  };

  const flowNote = isBleeding(draft.flow) && !detail.data?.insidePeriod
    ? 'Esse dia entra na sua menstruacao.'
    : null;

  return (
    <AppScreen>
      <AppHeader
        onBack={handleBack}
        subtitle={formatLongDate(date)}
        title="Registro do dia"
      />

      <View style={styles.dayNav}>
        <AppButton
          onPress={() => setDate((current) => addDaysIso(current, -1))}
          size="sm"
          title="< Dia anterior"
          variant="ghost"
        />
        <AppButton
          disabled={isToday}
          onPress={() => setDate((current) => addDaysIso(current, 1))}
          size="sm"
          title="Proximo dia >"
          variant="ghost"
        />
      </View>

      {feedback && (
        <FeedbackMessage
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          variant={feedback.variant}
        />
      )}

      <AppCard
        subtitle={flowNote ?? undefined}
        title="Fluxo"
        titleStyle={focus === 'flow' ? styles.focused : undefined}
      >
        <View style={styles.chipGroup}>
          <AppChip
            label="Nenhum"
            onPress={() => update({ flow: null })}
            selected={draft.flow === null}
            tone="primary"
          />
          {flowLevels.map((level) => (
            <AppChip
              key={level}
              label={flowLabels[level]}
              onPress={() => update({ flow: level as FlowLevel })}
              selected={draft.flow === level}
              tone="primary"
            />
          ))}
        </View>
      </AppCard>

      <AppCard
        title="Sintomas"
        titleStyle={focus === 'symptoms' ? styles.focused : undefined}
      >
        {groups.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupTitle}>{group.category}</Text>
            <View style={styles.chipGroup}>
              {group.symptoms.map((symptom) => (
                <AppChip
                  key={symptom.key}
                  label={symptom.name}
                  onPress={() => toggleSymptom(symptom.key)}
                  selected={draft.symptoms.some(
                    (selected) => selected.key === symptom.key,
                  )}
                  tone="rose"
                />
              ))}
            </View>
            {group.symptoms
              .filter(
                (symptom) =>
                  symptom.askIntensity &&
                  draft.symptoms.some((selected) => selected.key === symptom.key),
              )
              .map((symptom) => (
                <View key={`${symptom.key}-intensity`} style={styles.intensity}>
                  <Text style={styles.intensityLabel}>
                    Intensidade de {symptom.name}
                  </Text>
                  <View style={styles.chipGroup}>
                    {symptomIntensities.map((level) => (
                      <AppChip
                        key={level}
                        label={level}
                        onPress={() => setIntensity(symptom.key, level)}
                        selected={
                          draft.symptoms.find(
                            (selected) => selected.key === symptom.key,
                          )?.intensity === level
                        }
                        tone="primary"
                      />
                    ))}
                  </View>
                </View>
              ))}
          </View>
        ))}

        <View style={styles.custom}>
          <AppTextInput
            label="Outro sintoma"
            onChangeText={setCustomName}
            placeholder="Escreva e adicione a sua lista"
            value={customName}
          />
          <AppButton
            disabled={customName.trim().length === 0}
            onPress={handleAddCustom}
            title="Adicionar sintoma"
            variant="secondary"
          />
        </View>
      </AppCard>

      <AppCard
        title="Como voce se sentiu"
        titleStyle={focus === 'mood' ? styles.focused : undefined}
      >
        <View style={styles.chipGroup}>
          {moodLevels.map((mood) => (
            <AppChip
              key={mood}
              label={moodLabels[mood]}
              onPress={() =>
                update({ mood: draft.mood === mood ? null : (mood as MoodLevel) })
              }
              selected={draft.mood === mood}
              tone="peach"
            />
          ))}
        </View>
      </AppCard>

      <AppCard title="Anotacoes">
        <AppTextInput
          multiline
          onChangeText={(notes) => update({ notes })}
          placeholder="O que voce quer lembrar sobre hoje?"
          value={draft.notes}
        />
      </AppCard>

      <AppButton
        fullWidth
        loading={saving}
        onPress={handleSave}
        size="lg"
        title="Salvar registro"
      />

      <Pressable
        accessibilityRole="button"
        onPress={handleDelete}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>Apagar o registro deste dia</Text>
      </Pressable>

      <MedicalDisclaimer compact />
    </AppScreen>
  );
}

function withSymptom(
  symptoms: DayLogDraft['symptoms'],
  key: string,
): DayLogDraft['symptoms'] {
  return symptoms.some((symptom) => symptom.key === key)
    ? symptoms
    : [...symptoms, { intensity: null, key }];
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  custom: {
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  dayNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteText: {
    color: theme.colors.destructive,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
  },
  focused: {
    color: theme.colors.primary,
  },
  group: {
    gap: theme.spacing.sm,
  },
  groupTitle: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: theme.typography.sizes.xs,
    textTransform: 'uppercase',
  },
  intensity: {
    gap: theme.spacing.xs,
  },
  intensityLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
  },
});
