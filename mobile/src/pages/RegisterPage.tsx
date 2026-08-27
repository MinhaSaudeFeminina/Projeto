import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthField } from '../components/auth/AuthField';
import { AuthScreenLayout } from '../components/auth/AuthScreenLayout';
import { PasswordField } from '../components/auth/PasswordField';
import { AppButton } from '../components/ui/AppButton';
import { FeedbackMessage } from '../components/ui/FeedbackMessage';
import { useAuthContext } from '../context/AuthContext';
import { brDateToIso, maskBrDate } from '../utils/date';
import type { RootStackNavigation } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

const minimumPasswordLength = 8;

export function RegisterPage() {
  const navigation = useNavigation<RootStackNavigation>();
  const { clearError, error, loading, register } = useAuthContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const birthDateIso = brDateToIso(birthDate);
  const errors = {
    name: name.trim().length === 0 ? 'Informe seu nome.' : undefined,
    email: email.trim().length === 0 ? 'Informe seu e-mail.' : undefined,
    birthDate: !birthDateIso
      ? 'Informe uma data no formato DD/MM/AAAA.'
      : birthDateIso >= new Date().toISOString().slice(0, 10)
        ? 'A data de nascimento deve ser anterior a hoje.'
        : undefined,
    password:
      password.length < minimumPasswordLength
        ? `A senha precisa ter ao menos ${minimumPasswordLength} caracteres.`
        : undefined,
    passwordConfirmation:
      passwordConfirmation !== password ? 'As senhas nao conferem.' : undefined,
    acceptedTerms: !acceptedTerms
      ? 'E necessario aceitar os termos para continuar.'
      : undefined,
  };

  const canSubmit = Object.values(errors).every((message) => !message);

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!canSubmit || !birthDateIso) {
      return;
    }

    await register({
      accepted_terms: acceptedTerms,
      birth_date: birthDateIso,
      email: email.trim(),
      name: name.trim(),
      password,
    });
  };

  const goToLogin = () => {
    clearError();
    navigation.navigate('Login');
  };

  // Errors only surface after the first submit, so the form stays quiet while
  // it is still being filled in.
  const errorFor = (field: keyof typeof errors) =>
    submitted ? errors[field] : undefined;

  return (
    <AuthScreenLayout
      footer={
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Ja tem uma conta?</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={goToLogin}>
            <Text style={styles.switchLink}>Entrar</Text>
          </Pressable>
        </View>
      }
      formSubtitle="Leva menos de um minuto."
      formTitle="Criar conta"
      heroSubtitle="Crie sua conta para acompanhar seu ciclo, sintomas e conteudos feitos para voce."
      heroTitle="Vamos comecar juntas."
    >
      {error ? (
        <FeedbackMessage
          message={error}
          onDismiss={clearError}
          title="Nao foi possivel criar sua conta"
          variant="warning"
        />
      ) : null}

      <View style={styles.fields}>
        <AuthField
          autoCapitalize="words"
          autoComplete="name"
          error={errorFor('name')}
          icon="person-outline"
          label="Nome"
          onChangeText={setName}
          placeholder="Como voce quer ser chamada"
          returnKeyType="next"
          textContentType="name"
          value={name}
        />

        <AuthField
          autoCapitalize="none"
          autoComplete="email"
          error={errorFor('email')}
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

        <AuthField
          error={errorFor('birthDate')}
          icon="calendar-outline"
          inputMode="numeric"
          keyboardType="number-pad"
          label="Data de nascimento"
          maxLength={10}
          onChangeText={(value) => setBirthDate(maskBrDate(value))}
          placeholder="DD/MM/AAAA"
          returnKeyType="next"
          value={birthDate}
        />

        <PasswordField
          autoComplete="new-password"
          error={errorFor('password')}
          label="Senha"
          onChangeText={setPassword}
          placeholder={`Ao menos ${minimumPasswordLength} caracteres`}
          returnKeyType="next"
          textContentType="newPassword"
          value={password}
        />

        <PasswordField
          autoComplete="new-password"
          error={errorFor('passwordConfirmation')}
          label="Confirmar senha"
          onChangeText={setPasswordConfirmation}
          onSubmitEditing={handleSubmit}
          placeholder="Repita a senha"
          returnKeyType="done"
          textContentType="newPassword"
          value={passwordConfirmation}
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          onPress={() => setAcceptedTerms((current) => !current)}
          style={styles.termsRow}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
            {acceptedTerms ? (
              <Ionicons
                color={theme.colors.primaryForeground}
                name="checkmark"
                size={16}
              />
            ) : null}
          </View>
          <Text style={styles.termsText}>
            Li e aceito os termos de uso e a politica de privacidade.
          </Text>
        </Pressable>
        {errorFor('acceptedTerms') ? (
          <Text style={styles.termsError}>{errors.acceptedTerms}</Text>
        ) : null}
      </View>

      <AppButton
        fullWidth
        icon={
          <Ionicons
            color={theme.colors.primaryForeground}
            name="person-add-outline"
            size={20}
          />
        }
        loading={loading}
        onPress={handleSubmit}
        size="lg"
        style={styles.submitButton}
        textStyle={styles.submitLabel}
        title="Criar conta"
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.rose,
    borderRadius: 7,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxOn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  fields: {
    gap: 18,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    ...theme.shadows.raised,
  },
  submitLabel: {
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.md,
  },
  switchLink: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.extraBold,
    fontSize: theme.typography.sizes.sm,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  switchText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.sm,
  },
  termsError: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.semibold,
    fontSize: theme.typography.sizes.xs,
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  termsText: {
    color: theme.colors.foreground,
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
});
