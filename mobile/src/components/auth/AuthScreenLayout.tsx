import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { theme } from '../../utils/theme';
import { SafeAreaScreen } from '../layout/SafeAreaScreen';

export type AuthScreenLayoutProps = {
  heroTitle: string;
  heroSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreenLayout({
  heroTitle,
  heroSubtitle,
  formTitle,
  formSubtitle,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      const scrollToTop = () => {
        scrollRef.current?.scrollTo({ animated: false, y: 0 });
      };

      scrollToTop();
      const frame = requestAnimationFrame(() => {
        scrollToTop();
      });
      // Native-stack finishes its web transition after the first frame and can
      // restore the previous screen's scroll offset. Reset once more afterward.
      const timeout = setTimeout(scrollToTop, 250);

      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timeout);
      };
    }, []),
  );

  return (
    <SafeAreaScreen style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <LinearGradient
              colors={theme.gradients.warm}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.hero}
            >
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <Ionicons
                    color={theme.colors.primaryForeground}
                    name="heart"
                    size={27}
                  />
                </View>
                <View>
                  <Text style={styles.brandName}>Minha Saúde</Text>
                  <Text style={styles.brandSuffix}>Feminina</Text>
                </View>
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{heroTitle}</Text>
                <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
              </View>
            </LinearGradient>

            <View style={styles.formPanel}>
              <View style={styles.formHeading}>
                <Text style={styles.formTitle}>{formTitle}</Text>
                <Text style={styles.formSubtitle}>{formSubtitle}</Text>
              </View>

              {children}

              <View style={styles.footer}>
                {footer}
                <View style={styles.securityNote}>
                  <Ionicons
                    color={theme.colors.rose}
                    name="shield-checkmark-outline"
                    size={16}
                  />
                  <Text style={styles.securityText}>Acesso protegido</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
    ...theme.shadows.raised,
  },
  brandName: {
    color: theme.colors.display,
    fontFamily: theme.typography.fonts.display,
    fontSize: 22,
    lineHeight: 26,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  // Echoes the web sidebar, where "Feminina" sits under the script logotype.
  brandSuffix: {
    color: theme.colors.secondaryForeground,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: 11,
    letterSpacing: 2.4,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  footer: {
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 16,
    paddingTop: 8,
  },
  formHeading: {
    gap: 5,
  },
  formPanel: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexGrow: 1,
    gap: 24,
    marginTop: -24,
    minHeight: 430,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  formSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: 16,
    lineHeight: 22,
  },
  formTitle: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: 29,
  },
  hero: {
    gap: 34,
    minHeight: 260,
    paddingBottom: 56,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  heroCopy: {
    gap: 10,
    maxWidth: 330,
  },
  heroSubtitle: {
    color: theme.colors.foreground,
    fontSize: 17,
    lineHeight: 24,
  },
  heroTitle: {
    color: theme.colors.heading,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: 34,
    lineHeight: 38,
  },
  keyboard: {
    flex: 1,
  },
  safeArea: {
    // Matches the first gradient stop so the status-bar inset has no seam.
    backgroundColor: theme.gradients.warm[0],
  },
  screen: {
    alignSelf: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    maxWidth: 560,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
  },
  securityNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  securityText: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: 14,
  },
});
