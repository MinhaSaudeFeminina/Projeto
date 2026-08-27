import { StyleSheet, Text } from 'react-native';

import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type NotFoundPageProps = RootStackScreenProps<'NotFound'>;

export function NotFoundPage({ navigation, route }: NotFoundPageProps) {
  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppCard contentStyle={styles.card}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Tela nao encontrada</Text>
        <Text style={styles.message}>
          {route.params?.attemptedRoute
            ? `Rota solicitada: ${route.params.attemptedRoute}`
            : 'Use a navegacao principal para voltar ao app.'}
        </Text>
        <AppButton
          onPress={() => navigation.navigate('MainTabs', { screen: 'Today' })}
          title="Voltar para Hoje"
        />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  code: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: 44,
  },
  message: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xl,
    textAlign: 'center',
  },
});
