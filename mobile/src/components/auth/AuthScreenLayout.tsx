import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaScreen } from '../layout/SafeAreaScreen';
import { authColors } from './authTheme';

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
  return (
    <SafeAreaScreen style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <View style={styles.hero}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <Ionicons
                    color={authColors.primaryForeground}
                    name="heart"
                    size={27}
                  />
                </View>
                <Text style={styles.brandName}>Minha Saude Feminina</Text>
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{heroTitle}</Text>
                <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
              </View>
            </View>

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
                    color={authColors.rose}
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
    backgroundColor: authColors.primary,
    borderRadius: 16,
    elevation: 4,
    height: 52,
    justifyContent: 'center',
    shadowColor: authColors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    width: 52,
  },
  brandName: {
    color: authColors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 24,
    paddingTop: 8,
  },
  formHeading: {
    gap: 5,
  },
  formPanel: {
    backgroundColor: authColors.background,
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
    color: authColors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  formTitle: {
    color: authColors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  hero: {
    backgroundColor: authColors.softPink,
    gap: 34,
    minHeight: 286,
    paddingBottom: 56,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  heroCopy: {
    gap: 10,
    maxWidth: 330,
  },
  heroSubtitle: {
    color: authColors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  heroTitle: {
    color: authColors.primaryDark,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  keyboard: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: authColors.softPink,
  },
  screen: {
    backgroundColor: authColors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  securityNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  securityText: {
    color: authColors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
});
