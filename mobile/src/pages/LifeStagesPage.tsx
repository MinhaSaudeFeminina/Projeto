import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { lifeStageTracks } from '../data/staticContent';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type LifeStagesPageProps = RootStackScreenProps<'LifeStages'>;

export function LifeStagesPage({ navigation }: LifeStagesPageProps) {
  const handleBack = () => navigateBackOrToday(navigation);

  return (
    <AppScreen>
      <AppHeader
        onBack={handleBack}
        subtitle="Conteudos e cuidados para cada momento da sua jornada"
        title="Trilhas por fase da vida"
      />

      <View style={styles.list}>
        {lifeStageTracks.map((stage) => (
          <AppCard key={stage.id}>
            <View style={styles.stageRow}>
              <Text style={styles.stageIcon}>{stage.icon}</Text>
              <View style={styles.stageCopy}>
                <View style={styles.titleRow}>
                  <Text style={styles.stageTitle}>{stage.label}</Text>
                  {stage.age ? (
                    <AppChip label={stage.age} tone="primary" disabled />
                  ) : null}
                </View>
                <Text style={styles.stageDescription}>{stage.description}</Text>
                <AppButton
                  onPress={() =>
                    navigation.navigate('MainTabs', { screen: 'Contents' })
                  }
                  title="Ver conteudos"
                  variant="ghost"
                />
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md,
  },
  stageCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  stageDescription: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  stageIcon: {
    fontSize: theme.typography.sizes.xxl,
    lineHeight: 34,
  },
  stageRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stageTitle: {
    color: theme.colors.foreground,
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 22,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
