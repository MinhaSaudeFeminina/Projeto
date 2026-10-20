import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { ScreenHero } from '../components/layout/ScreenHero';
import { AppCard } from '../components/ui/AppCard';
import { getSupportInfo } from '../services/supportService';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type SupportPageProps = RootStackScreenProps<'Support'>;

export function SupportPage({ navigation }: SupportPageProps) {
  const supportInfo = getSupportInfo();
  const handleBack = () => navigateBackOrToday(navigation);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <ScreenHero>
        <AppHeader
          onBack={handleBack}
          subtitle={supportInfo.description}
          title="Suporte e acolhimento"
        />
      </ScreenHero>

      <AppCard style={styles.emergencyCard}>
        <Text style={styles.emergencyIcon}>SOS</Text>
        <Text style={styles.emergencyTitle}>Preciso de ajuda</Text>
        <Text style={styles.emergencyText}>
          Ligue 180 — Central de Atendimento à Mulher
        </Text>
        <Text style={styles.emergencyText}>24h, gratuito e sigiloso</Text>
      </AppCard>

      <AppCard title="Violência contra a mulher">
        <Text style={styles.bodyText}>
          A violência contra a mulher pode ser física, psicológica, sexual,
          patrimonial ou moral. Nenhuma forma de violência é aceitável. Na UBS,
          você pode relatar situações de violência com sigilo e sem julgamentos.
        </Text>
      </AppCard>

      <View style={styles.contacts}>
        <Text style={styles.sectionTitle}>Telefones úteis</Text>
        {supportInfo.contacts.map((contact) => (
          <AppCard key={contact.number}>
            <View style={styles.contactRow}>
              <View style={styles.phoneCircle}>
                <Ionicons color={theme.colors.primary} name="call" size={20} />
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
          A Unidade Básica de Saúde é a porta de entrada para cuidados de saúde
          da mulher. Lá você pode realizar exames preventivos, pré-natal,
          planejamento familiar e receber orientação sobre saúde íntima.
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
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
  },
  contactNumber: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.lg,
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
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.xl,
    textAlign: 'center',
  },
  emergencyText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
  },
  emergencyTitle: {
    color: theme.colors.destructive,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
  },
  phoneCircle: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  screen: {
    paddingTop: 0,
  },
  sectionTitle: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.md,
  },
});
