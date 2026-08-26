import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import { getCycleSummary } from '../services/cycleService';
import { formatShortDate } from '../utils/date';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

export function ProfilePage() {
  const navigation = useNavigation<RootStackNavigation>();
  const { logout } = useAuthContext();
  const { error, loading, profile, refreshProfile } = useAppContext();
  const cycle = useApiResource(getCycleSummary, []);

  if (loading) {
    return (
      <AppScreen>
        <AppHeader title="Perfil" />
        <LoadingState message="Carregando seu perfil." />
      </AppScreen>
    );
  }

  if (!profile) {
    return (
      <AppScreen>
        <AppHeader title="Perfil" />
        <ErrorMessage
          action={<AppButton onPress={refreshProfile} title="Tentar novamente" />}
          message={error ?? 'Nao foi possivel carregar o perfil.'}
        />
      </AppScreen>
    );
  }

  const stats = cycle.data?.stats;

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
        </View>
        <AppHeader subtitle={profile.email} title={profile.name} />
      </View>

      {error && <ErrorMessage compact message={error} />}

      <AppCard title="Seus dados">
        <InfoRow
          label="Data de nascimento"
          value={
            profile.birthDate ? formatShortDate(profile.birthDate) : 'Nao informada'
          }
        />
        <InfoRow
          label="Idade"
          value={profile.age !== null ? `${profile.age} anos` : '--'}
        />
      </AppCard>

      <AppCard title="Informacoes do ciclo">
        <InfoRow
          label="Duracao media do ciclo"
          value={
            stats?.averageCycleDays ? `${stats.averageCycleDays} dias` : '--'
          }
        />
        <InfoRow
          label="Duracao media do periodo"
          value={
            stats?.averagePeriodDays ? `${stats.averagePeriodDays} dias` : '--'
          }
        />
        <InfoRow
          label="Ultima menstruacao"
          value={
            stats?.lastPeriodStart
              ? formatShortDate(stats.lastPeriodStart)
              : 'Nenhuma registrada'
          }
        />
      </AppCard>

      <AppCard title="Estatisticas">
        <View style={styles.stats}>
          <StatCard label="Ciclos" value={`${stats?.cyclesRecorded ?? 0}`} />
          <StatCard label="Regularidade" value={stats?.regularity ?? 'Sem dados'} />
          <StatCard
            label="Duracao media"
            value={stats?.averageCycleDays ? `${stats.averageCycleDays}d` : '--'}
          />
        </View>
      </AppCard>

      <View style={styles.links}>
        <QuickLink
          icon="!"
          label="Suporte e acolhimento"
          onPress={() => navigation.navigate('Support')}
        />
        <QuickLink
          icon="*"
          label="Trilhas por fase da vida"
          onPress={() => navigation.navigate('LifeStages')}
        />
      </View>

      <AppButton
        fullWidth
        onPress={logout}
        title="Sair"
        variant="ghost"
      />
    </AppScreen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]}
    >
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.extraBold,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: theme.colors.lilasLight,
    borderBottomLeftRadius: theme.radii.xxl,
    borderBottomRightRadius: theme.radii.xxl,
    gap: theme.spacing.md,
    marginHorizontal: -theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    padding: theme.spacing.xl,
  },
  infoLabel: {
    color: theme.colors.mutedForeground,
    flex: 1,
    fontSize: theme.typography.sizes.sm,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoValue: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  links: {
    gap: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.82,
  },
  quickIcon: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extraBold,
    width: 24,
  },
  quickLabel: {
    color: theme.colors.foreground,
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  quickLink: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  screen: {
    paddingTop: 0,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.md,
    flex: 1,
    gap: theme.spacing.xs,
    minHeight: 74,
    padding: theme.spacing.md,
  },
  statLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extraBold,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
