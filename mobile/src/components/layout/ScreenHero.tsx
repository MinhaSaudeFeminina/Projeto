import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '../../utils/theme';

export type ScreenHeroProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Warm gradient banner at the top of a screen, mirroring the web `gradient-warm`
 * panels. It bleeds past the padding of {@link AppScreen}, so pair it with a
 * `paddingTop: 0` content style.
 */
export function ScreenHero({ children, style }: ScreenHeroProps) {
  return (
    <LinearGradient
      colors={theme.gradients.warm}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[styles.hero, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderBottomLeftRadius: theme.radii.xxl,
    borderBottomRightRadius: theme.radii.xxl,
    marginHorizontal: -theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
});
