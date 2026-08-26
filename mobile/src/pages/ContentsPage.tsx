import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { ScreenHero } from '../components/layout/ScreenHero';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { AppTextInput } from '../components/ui/AppTextInput';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { useApiResource } from '../hooks/useApiResource';
import {
  getContentCategories,
  getFilteredContents,
} from '../services/contentService';
import { categoryTone } from '../utils/categoryTone';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

export function ContentsPage() {
  const navigation = useNavigation<RootStackNavigation>();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const categories = useApiResource(getContentCategories, []);
  const contents = useApiResource(
    () => getFilteredContents({ categorySlug: activeCategory, query: search }),
    [activeCategory, search],
  );

  if (categories.error ?? contents.error) {
    return (
      <AppScreen>
        <ErrorMessage
          message={
            categories.error ??
            contents.error ??
            'Nao foi possivel carregar os conteudos.'
          }
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <ScreenHero style={styles.hero}>
        <AppHeader
          subtitle="Informacao segura para sua saude e bem-estar"
          title="Conteudos"
        />
        <AppTextInput
          accessibilityLabel="Buscar conteudo"
          onChangeText={setSearch}
          placeholder="Buscar conteudo..."
          value={search}
        />
      </ScreenHero>

      <ScrollView
        contentContainerStyle={styles.categories}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <AppChip
          label="Todos"
          onPress={() => setActiveCategory(undefined)}
          selected={!activeCategory}
          tone="primary"
        />
        {(categories.data ?? []).map((category) => (
          <AppChip
            key={category.id}
            label={category.name}
            onPress={() =>
              setActiveCategory((current) =>
                current === category.slug ? undefined : category.slug,
              )
            }
            selected={activeCategory === category.slug}
            tone={categoryTone(category.slug)}
          />
        ))}
      </ScrollView>

      {contents.loading ? (
        <LoadingState message="Buscando conteudos publicados." />
      ) : (
        <View style={[styles.list, contents.refreshing && styles.refreshing]}>
          {(contents.data ?? []).map((content) => (
            <Pressable
              accessibilityRole="button"
              key={content.id}
              onPress={() =>
                navigation.navigate('ContentDetail', { slug: content.slug })
              }
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.pressed,
              ]}
            >
              <AppCard contentStyle={styles.contentCard}>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{content.title}</Text>
                  {content.summary ? (
                    <Text numberOfLines={2} style={styles.cardSummary}>
                      {content.summary}
                    </Text>
                  ) : null}
                  {content.category.name ? (
                    <AppChip
                      disabled
                      label={content.category.name}
                      style={styles.inlineChip}
                      tone={categoryTone(content.category.slug)}
                    />
                  ) : null}
                </View>
              </AppCard>
            </Pressable>
          ))}
        </View>
      )}

      {!contents.loading && (contents.data ?? []).length === 0 && (
        <EmptyState
          message="Tente buscar por outro termo ou categoria."
          title="Nenhum conteudo encontrado"
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardPressable: {
    width: '100%',
  },
  cardSummary: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  cardTitle: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
    lineHeight: 22,
  },
  categories: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  contentCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  hero: {
    gap: theme.spacing.lg,
  },
  inlineChip: {
    marginTop: theme.spacing.xs,
  },
  list: {
    gap: theme.spacing.md,
  },
  pressed: {
    opacity: 0.82,
  },
  refreshing: {
    opacity: 0.55,
  },
  screen: {
    paddingTop: 0,
  },
});
