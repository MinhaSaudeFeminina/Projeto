import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../utils/theme';

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Migracao em andamento</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.extraBold,
    textAlign: 'center',
  },
  description: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.md,
    lineHeight: 24,
    maxWidth: 320,
    textAlign: 'center',
  },
});
