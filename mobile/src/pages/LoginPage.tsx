import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { SafeAreaScreen } from '../components/layout/SafeAreaScreen';
import { AppButton } from '../components/ui/AppButton';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { useAuthContext } from '../context/AuthContext';

const loginColors = {
  background: '#FBF4EB',
  border: '#F0D8E0',
  input: '#FFFDFC',
  muted: '#89656E',
  primary: '#C43A4A',
  primaryDark: '#8D3140',
  primaryForeground: '#FFF9F4',
  rose: '#C56682',
  softPink: '#FBD9E5',
  text: '#5B3038',
} as const;

type FieldProps = TextInputProps & {
  error?: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  trailing?: ReactNode;
};

function LoginField({ error, icon, label, trailing, ...inputProps }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <Ionicons color={loginColors.rose} name={icon} size={21} />
        <TextInput
          placeholderTextColor={loginColors.muted}
          style={styles.input}
          {...inputProps}
        />
        {trailing}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function LoginPage() {
  const { clearError, error, loading, login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailError =
    submitted && email.trim().length === 0 ? 'Informe seu e-mail.' : undefined;
  const passwordError =
    submitted && password.length === 0 ? 'Informe sua senha.' : undefined;
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!canSubmit) {
      return;
    }

    await login({
      email: email.trim(),
      password,
    });
  };

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
                    color={loginColors.primaryForeground}
                    name="heart"
                    size={27}
                  />
                </View>
                <Text style={styles.brandName}>Minha Saude Feminina</Text>
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Seu cuidado comeca aqui.</Text>
                <Text style={styles.heroSubtitle}>
                  Entre para acompanhar sua saude de um jeito simples e seguro.
                </Text>
              </View>
            </View>

            <View style={styles.formPanel}>
              <View style={styles.formHeading}>
                <Text style={styles.formTitle}>Acesse sua conta</Text>
                <Text style={styles.formSubtitle}>
                  Informe seus dados para continuar.
                </Text>
              </View>

              {error ? (
                <FeedbackMessage
                  message={error}
                  onDismiss={clearError}
                  title="Nao foi possivel entrar"
                  variant="warning"
                />
              ) : null}

              <View style={styles.fields}>
                <LoginField
                  autoCapitalize="none"
                  autoComplete="email"
                  error={emailError}
                  icon="mail-outline"
                  inputMode="email"
                  keyboardType="email-address"
                  label="E-mail"
                  onChangeText={setEmail}
                  placeholder="seuemail@exemplo.com"
                  returnKeyType="next"
                  textContentType="emailAddress"
                  value={email}
                />

                <LoginField
                  autoCapitalize="none"
                  autoComplete="password"
                  error={passwordError}
                  icon="lock-closed-outline"
                  label="Senha"
                  onChangeText={setPassword}
                  onSubmitEditing={handleSubmit}
                  placeholder="Digite sua senha"
                  returnKeyType="done"
                  secureTextEntry={!passwordVisible}
                  textContentType="password"
                  trailing={
                    <Pressable
                      accessibilityLabel={
                        passwordVisible ? 'Ocultar senha' : 'Mostrar senha'
                      }
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setPasswordVisible((current) => !current)}
                      style={styles.visibilityButton}
                    >
                      <Ionicons
                        color={loginColors.muted}
                        name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={21}
                      />
                    </Pressable>
                  }
                  value={password}
                />
              </View>

              <AppButton
                disabled={!canSubmit}
                fullWidth
                icon={
                  <Ionicons
                    color={loginColors.primaryForeground}
                    name="log-in-outline"
                    size={20}
                  />
                }
                loading={loading}
                onPress={handleSubmit}
                size="lg"
                style={styles.submitButton}
                textStyle={styles.submitLabel}
                title="Entrar"
              />

              <View style={styles.securityNote}>
                <Ionicons
                  color={loginColors.rose}
                  name="shield-checkmark-outline"
                  size={16}
                />
                <Text style={styles.securityText}>Acesso protegido</Text>
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
    backgroundColor: loginColors.primary,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    shadowColor: loginColors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    width: 52,
    elevation: 4,
  },
  brandName: {
    color: loginColors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  fieldError: {
    color: loginColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    color: loginColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  fields: {
    gap: 18,
  },
  formHeading: {
    gap: 5,
  },
  formPanel: {
    backgroundColor: loginColors.background,
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
    color: loginColors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  formTitle: {
    color: loginColors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  hero: {
    backgroundColor: loginColors.softPink,
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
    color: loginColors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  heroTitle: {
    color: loginColors.primaryDark,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  input: {
    color: loginColors.text,
    flex: 1,
    fontSize: 16,
    height: 54,
    paddingVertical: 0,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: loginColors.input,
    borderColor: loginColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 8,
  },
  inputShellError: {
    borderColor: loginColors.primary,
  },
  keyboard: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: loginColors.softPink,
  },
  screen: {
    backgroundColor: loginColors.background,
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
    marginTop: 'auto',
    paddingBottom: 24,
    paddingTop: 8,
  },
  securityText: {
    color: loginColors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: loginColors.primary,
    borderRadius: 14,
    shadowColor: loginColors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  visibilityButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 40,
  },
});
