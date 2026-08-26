import { fail, ok, type ApiResult } from '../api/types';
import {
  chatResponses,
  type AnonymousMessage,
} from '../data/staticContent';
import { isBlank, normalizeText } from '../utils/text';

const UBS_GUIDANCE =
  ' Para uma avaliacao personalizada, procure sua UBS. Os profissionais de saude estao preparados para te acolher e orientar.';

export type AnonymousQuestionResult = {
  userMessage: AnonymousMessage;
  botMessage: AnonymousMessage;
  responseKey: keyof typeof chatResponses;
};

export function createAnonymousMessage(
  text: string,
  isUser: boolean,
): AnonymousMessage {
  return {
    id: `${Date.now()}-${isUser ? 'user' : 'bot'}`,
    text,
    isUser,
  };
}

export function resolveAnonymousResponseKey(
  input: string,
): keyof typeof chatResponses {
  const normalizedInput = normalizeText(input);

  if (normalizedInput.includes('corrimento')) {
    return 'corrimento';
  }

  if (normalizedInput.includes('colica')) {
    return 'colica';
  }

  if (
    normalizedInput.includes('atraso') ||
    normalizedInput.includes('atrasou')
  ) {
    return 'atraso';
  }

  if (normalizedInput.includes('normal')) {
    return 'normal';
  }

  return 'default';
}

export function getAnonymousResponse(input: string): ApiResult<string> {
  if (isBlank(input)) {
    return fail(
      'EMPTY_ANONYMOUS_QUESTION',
      'Digite sua pergunta antes de enviar.',
    );
  }

  const responseKey = resolveAnonymousResponseKey(input);
  const response = chatResponses[responseKey];

  return ok(
    response.includes('UBS') ? response : `${response}${UBS_GUIDANCE}`,
  );
}

export function submitAnonymousQuestion(
  input: string,
): ApiResult<AnonymousQuestionResult> {
  const trimmedInput = input.trim();
  const response = getAnonymousResponse(trimmedInput);

  if (!response.ok) {
    return response;
  }

  const responseKey = resolveAnonymousResponseKey(trimmedInput);

  return ok({
    userMessage: createAnonymousMessage(trimmedInput, true),
    botMessage: createAnonymousMessage(response.data, false),
    responseKey,
  });
}
