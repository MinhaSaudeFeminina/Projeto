import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import {
  getContentById,
  getContentCategories,
} from '../services/contentService';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type ContentDetailPageProps = RootStackScreenProps<'ContentDetail'>;

export function ContentDetailPage({
  navigation,
  route,
}: ContentDetailPageProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const contentResult = getContentById(route.params.id);
  const categoriesResult = getContentCategories();
  const handleBack = () => navigateBackOrToday(navigation);

  if (!contentResult.ok || !categoriesResult.ok) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Conteudo" />
        <ErrorMessage
          action={
            <AppButton
              onPress={handleBack}
              title="Voltar"
              variant="secondary"
            />
          }
          message="Conteudo nao encontrado."
        />
      </AppScreen>
    );
  }

  const content = contentResult.data;
  const category = categoriesResult.data.find(
    (item) => item.id === content.categoryId,
  );

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <AppHeader
          onBack={handleBack}
          subtitle={content.summary}
          title={content.title}
        />
        {category && (
          <AppChip
            icon={<Text style={styles.categoryIcon}>{category.icon}</Text>}
            label={category.label}
            tone={category.color}
          />
        )}
      </View>

      {feedback && (
        <FeedbackMessage
          message={feedback}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <AppCard title="O que e normal">
        <Text style={styles.bodyText}>{content.normalText}</Text>
      </AppCard>

      <AppCard style={styles.highlightCard} title="Quando procurar a UBS">
        <Text style={styles.bodyText}>{content.ubsText}</Text>
      </AppCard>

      <AppCard title="O que voce pode fazer em casa">
        <Text style={styles.bodyText}>{content.homeCareText}</Text>
      </AppCard>

      <MedicalDisclaimer />

      <View style={styles.actions}>
        <AppButton
          onPress={() => setFeedback('Conteudo salvo!')}
          title="Salvar"
          variant="secondary"
        />
        <AppButton
          onPress={() => setFeedback('Link copiado!')}
          title="Compartilhar"
          variant="secondary"
        />
        <AppButton
          onPress={() => setFeedback('Lembrete adicionado!')}
          title="Lembrar"
          variant="secondary"
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  bodyText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 22,
  },
  categoryIcon: {
    fontSize: theme.typography.sizes.sm,
  },
  hero: {
    backgroundColor: theme.colors.rosaLight,
    borderBottomLeftRadius: theme.radii.xxl,
    borderBottomRightRadius: theme.radii.xxl,
    gap: theme.spacing.md,
    marginHorizontal: -theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  highlightCard: {
    backgroundColor: theme.colors.rosaLight,
  },
  screen: {
    paddingTop: 0,
  },
});
