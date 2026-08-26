import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { useApiResource } from '../hooks/useApiResource';
import { getContentBySlugOrFail } from '../services/contentService';
import { categoryTone } from '../utils/categoryTone';
import { formatLongDate } from '../utils/date';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type ContentDetailPageProps = RootStackScreenProps<'ContentDetail'>;

export function ContentDetailPage({
  navigation,
  route,
}: ContentDetailPageProps) {
  const { slug } = route.params;
  const handleBack = useCallback(
    () => navigateBackOrToday(navigation),
    [navigation],
  );

  const content = useApiResource(
    () => getContentBySlugOrFail(slug),
    [slug],
  );

  if (content.loading) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Conteudo" />
        <LoadingState message="Carregando o conteudo." />
      </AppScreen>
    );
  }

  if (!content.data) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Conteudo" />
        <ErrorMessage
          action={
            <AppButton onPress={handleBack} title="Voltar" variant="secondary" />
          }
          message={content.error ?? 'Conteudo nao encontrado.'}
        />
      </AppScreen>
    );
  }

  const article = content.data;

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <AppHeader
          onBack={handleBack}
          subtitle={article.summary ?? undefined}
          title={article.title}
        />
        {article.category.name ? (
          <AppChip
            label={article.category.name}
            tone={categoryTone(article.category.slug)}
          />
        ) : null}
      </View>

      <AppCard>
        <Text style={styles.bodyText}>{article.body}</Text>
      </AppCard>

      {article.published_at ? (
        <Text style={styles.published}>
          Publicado em {formatLongDate(article.published_at.slice(0, 10))}
        </Text>
      ) : null}

      <MedicalDisclaimer />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 22,
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
  published: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
  },
  screen: {
    paddingTop: 0,
  },
});
