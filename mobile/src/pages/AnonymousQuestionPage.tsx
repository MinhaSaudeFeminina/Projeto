import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from '../components/layout/AppScreen';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { MedicalDisclaimer } from '../components/ui/MedicalDisclaimer';
import { createAnonymousMessage, submitAnonymousQuestion } from '../services/anonymousQuestionService';
import type { AnonymousMessage } from '../data/staticContent';
import { navigateBackOrToday } from '../utils/navigation';
import type { RootStackScreenProps } from '../utils/navigationTypes';
import { theme } from '../utils/theme';

type AnonymousQuestionPageProps = RootStackScreenProps<'AnonymousQuestion'>;

const welcomeMessage = createAnonymousMessage(
  'Ola! Este e um espaco seguro para tirar suas duvidas sobre saude feminina. Suas perguntas sao anonimas e as respostas sao educativas.',
  false,
);

export function AnonymousQuestionPage({
  navigation,
}: AnonymousQuestionPageProps) {
  const scrollRef = useRef<ScrollView>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([
    welcomeMessage,
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const handleBack = () => navigateBackOrToday(navigation);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isResponding]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleSend = () => {
    const result = submitAnonymousQuestion(input);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setError(null);
    setInput('');
    setIsResponding(true);
    setMessages((current) => [...current, result.data.userMessage]);

    timeoutRef.current = setTimeout(() => {
      setMessages((current) => [...current, result.data.botMessage]);
      setIsResponding(false);
    }, 700);
  };

  return (
    <AppScreen contentContainerStyle={styles.screen} scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <AppHeader
          onBack={handleBack}
          subtitle="Suas duvidas sao sigilosas"
          title="Pergunta anonima"
        />

        <ScrollView
          contentContainerStyle={styles.messages}
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.isUser ? styles.userRow : styles.botRow,
              ]}
            >
              <Text
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.botBubble,
                ]}
              >
                {message.text}
              </Text>
            </View>
          ))}

          {isResponding && (
            <View style={[styles.messageRow, styles.botRow]}>
              <Text style={[styles.messageBubble, styles.botBubble]}>
                Respondendo...
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {error && <ErrorMessage compact message={error} />}
          <MedicalDisclaimer compact />
          <View style={styles.inputRow}>
            <AppTextInput
              containerStyle={styles.inputContainer}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              placeholder="Digite sua duvida..."
              returnKeyType="send"
              value={input}
            />
            <AppButton
              disabled={!input.trim() || isResponding}
              onPress={handleSend}
              title="Enviar"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  botBubble: {
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.radii.sm,
    borderColor: theme.colors.border,
    borderWidth: 1,
    color: theme.colors.foreground,
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  footer: {
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  inputContainer: {
    flex: 1,
  },
  inputRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  keyboard: {
    flex: 1,
    gap: theme.spacing.md,
  },
  messageBubble: {
    borderRadius: theme.radii.lg,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 21,
    maxWidth: '86%',
    padding: theme.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messages: {
    flexGrow: 1,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  screen: {
    flex: 1,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.radii.sm,
    color: theme.colors.primaryForeground,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
});
