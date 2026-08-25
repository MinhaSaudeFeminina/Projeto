import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthField } from '../components/auth/AuthField';
import { AuthScreenLayout } from '../components/auth/AuthScreenLayout';
import { authColors } from '../components/auth/authTheme';
import { PasswordField } from '../components/auth/PasswordField';
import { AppButton } from '../components/ui/AppButton';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { useAuthContext } from '../context/AuthContext';
import type { RootStackNavigation } from '../utils/navigationTypes';

export function LoginPage() {
  const navigation = useNavigation<RootStackNavigation>();
  const { clearError, error, loading, login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const goToRegister = () => {
    clearError();
    navigation.navigate('Register');
  };

  return (
    <AuthScreenLayout
      footer={
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Ainda nao tem conta?</Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={goToRegister}
          >
            <Text style={styles.switchLink}>Criar conta</Text>
          </Pressable>
        </View>
      }
      formSubtitle="Informe seus dados para continuar."
      formTitle="Acesse sua conta"
      heroSubtitle="Entre para acompanhar sua saude de um jeito simples e seguro."
      heroTitle="Seu cuidado comeca aqui."
    >
      {error ? (
        <FeedbackMessage
          message={error}
          onDismiss={clearError}
          title="Nao foi possivel entrar"
          variant="warning"
        />
      ) : null}

      <View style={styles.fields}>
        <AuthField
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

        <PasswordField
          autoComplete="password"
          error={passwordError}
          label="Senha"
          onChangeText={setPassword}
          onSubmitEditing={handleSubmit}
          placeholder="Digite sua senha"
          returnKeyType="done"
          textContentType="password"
          value={password}
        />
      </View>

      <AppButton
        disabled={!canSubmit}
        fullWidth
        icon={
          <Ionicons
            color={authColors.primaryForeground}
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
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 18,
  },
  submitButton: {
    backgroundColor: authColors.primary,
    borderRadius: 14,
    elevation: 3,
    shadowColor: authColors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  switchLink: {
    color: authColors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  switchText: {
    color: authColors.muted,
    fontSize: 14,
  },
});
