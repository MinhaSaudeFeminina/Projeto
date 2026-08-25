import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppCard } from '../components/ui/AppCard';
import { AppChip } from '../components/ui/AppChip';
import { AppTextInput } from '../components/ui/AppTextInput';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import {
  getContentCategories,
  getFilteredContents,
} from '../services/contentService';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

export function ContentsPage() {
  const navigation = useNavigation<RootStackNavigation>();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const categoriesResult = getContentCategories();
  const contentsResult = useMemo(
    () =>
      getFilteredContents({
        categoryId: activeCategory,
        query: search,
      }),
    [activeCategory, search],
  );

  if (!categoriesResult.ok || !contentsResult.ok) {
    return (
      <AppScreen>
        <ErrorMessage message="Nao foi possivel carregar os conteudos." />
      </AppScreen>
    );
  }

  const categories = categoriesResult.data;
  const contents = contentsResult.data;

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
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
      </View>

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
        {categories.map((category) => (
          <AppChip
            icon={<Text style={styles.categoryIcon}>{category.icon}</Text>}
            key={category.id}
            label={category.label}
            onPress={() =>
              setActiveCategory((current) =>
                current === category.id ? undefined : category.id,
              )
            }
            selected={activeCategory === category.id}
            tone={category.color}
          />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {contents.map((content) => {
          const category = categories.find(
            (item) => item.id === content.categoryId,
          );

          return (
            <Pressable
              accessibilityRole="button"
              key={content.id}
              onPress={() =>
                navigation.navigate('ContentDetail', { id: content.id })
              }
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.pressed,
              ]}
            >
              <AppCard contentStyle={styles.contentCard}>
                <Text style={styles.cardIcon}>{category?.icon}</Text>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{content.title}</Text>
                  <Text numberOfLines={2} style={styles.cardSummary}>
                    {content.summary}
                  </Text>
                  {category && (
                    <AppChip
                      label={category.label}
                      tone={category.color}
                      disabled
                      style={styles.inlineChip}
                    />
                  )}
                </View>
              </AppCard>
            </Pressable>
          );
        })}
      </View>

      {contents.length === 0 && (
        <EmptyState
          icon={<Text style={styles.emptyIcon}>?</Text>}
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
  cardIcon: {
    fontSize: theme.typography.sizes.xl,
    lineHeight: 28,
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
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 22,
  },
  categories: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  categoryIcon: {
    fontSize: theme.typography.sizes.sm,
  },
  contentCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  emptyIcon: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.extraBold,
  },
  hero: {
    backgroundColor: theme.colors.lilasLight,
    borderBottomLeftRadius: theme.radii.xxl,
    borderBottomRightRadius: theme.radii.xxl,
    gap: theme.spacing.lg,
    marginHorizontal: -theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
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
  screen: {
    paddingTop: 0,
  },
});
