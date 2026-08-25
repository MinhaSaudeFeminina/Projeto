import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppCard } from '../components/ui/AppCard';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { getSupportInfo } from '../services/supportService';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type SupportPageProps = RootStackScreenProps<'Support'>;

export function SupportPage({ navigation }: SupportPageProps) {
  const supportResult = getSupportInfo();
  const handleBack = () => navigateBackOrToday(navigation);

  if (!supportResult.ok) {
    return (
      <AppScreen>
        <AppHeader onBack={handleBack} title="Apoio" />
        <ErrorMessage message="Nao foi possivel carregar os canais de apoio." />
      </AppScreen>
    );
  }

  const supportInfo = supportResult.data;

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <AppHeader
          onBack={handleBack}
          subtitle={supportInfo.description}
          title="Suporte e acolhimento"
        />
      </View>

      <AppCard style={styles.emergencyCard}>
        <Text style={styles.emergencyIcon}>SOS</Text>
        <Text style={styles.emergencyTitle}>Preciso de ajuda</Text>
        <Text style={styles.emergencyText}>
          Ligue 180 - Central de Atendimento a Mulher
        </Text>
        <Text style={styles.emergencyText}>24h, gratuito e sigiloso</Text>
      </AppCard>

      <AppCard title="Violencia contra a mulher">
        <Text style={styles.bodyText}>
          A violencia contra a mulher pode ser fisica, psicologica, sexual,
          patrimonial ou moral. Nenhuma forma de violencia e aceitavel. Na UBS,
          voce pode relatar situacoes de violencia com sigilo e sem julgamentos.
        </Text>
      </AppCard>

      <View style={styles.contacts}>
        <Text style={styles.sectionTitle}>Telefones uteis</Text>
        {supportInfo.contacts.map((contact) => (
          <AppCard key={contact.number}>
            <View style={styles.contactRow}>
              <View style={styles.phoneCircle}>
                <Text style={styles.phoneIcon}>tel</Text>
              </View>
              <View style={styles.contactCopy}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDescription}>
                  {contact.description}
                </Text>
              </View>
              <Text style={styles.contactNumber}>{contact.number}</Text>
            </View>
          </AppCard>
        ))}
      </View>

      <AppCard title="Procure sua UBS">
        <Text style={styles.bodyText}>
          A Unidade Basica de Saude e a porta de entrada para cuidados de saude
          da mulher. La voce pode realizar exames preventivos, pre-natal,
          planejamento familiar e receber orientacao sobre saude intima.
        </Text>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 22,
  },
  contactCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  contactDescription: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 18,
  },
  contactName: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  contactNumber: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extraBold,
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  contacts: {
    gap: theme.spacing.sm,
  },
  emergencyCard: {
    backgroundColor: theme.colors.destructiveLight,
    borderColor: theme.colors.destructive,
  },
  emergencyIcon: {
    color: theme.colors.destructive,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.extraBold,
    textAlign: 'center',
  },
  emergencyText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
  },
  emergencyTitle: {
    color: theme.colors.destructive,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extraBold,
    textAlign: 'center',
  },
  hero: {
    backgroundColor: theme.colors.roxoLight,
    borderBottomLeftRadius: theme.radii.xxl,
    borderBottomRightRadius: theme.radii.xxl,
    marginHorizontal: -theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  phoneCircle: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  phoneIcon: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  screen: {
    paddingTop: 0,
  },
  sectionTitle: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});
