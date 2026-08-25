import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type QuestionStatus = "nova" | "em_analise" | "respondida" | "arquivada";
export type QuestionPriority = "baixa" | "media" | "alta" | "urgente";

export type QuestionAgent = {
  id: number;
  name: string;
};

export type AdminAnonymousQuestion = {
  id: number;
  question: string;
  category: string;
  status: QuestionStatus;
  priority: QuestionPriority;
  answer: string | null;
  internal_notes: string | null;
  is_sensitive: boolean;
  answered_by: number | null;
  answered_at: string | null;
  archived_by: number | null;
  archived_at: string | null;
  answered_by_user?: QuestionAgent | null;
  archived_by_user?: QuestionAgent | null;
  created_at: string;
  updated_at: string;
};

export type AnonymousQuestionFilters = {
  q?: string;
  status?: QuestionStatus;
  priority?: QuestionPriority;
};

export type AnonymousQuestionListResponse = {
  data: AdminAnonymousQuestion[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
};

type AnonymousQuestionResponse = { data: AdminAnonymousQuestion };

function authOptions() {
  return { token: getAdminToken() };
}

export function listAnonymousQuestions(
  filters: AnonymousQuestionFilters = {},
): Promise<AnonymousQuestionListResponse> {
  const query = new URLSearchParams();

  if (filters.q?.trim()) query.set("q", filters.q.trim());
  if (filters.status) query.set("status", filters.status);
  if (filters.priority) query.set("priority", filters.priority);

  const suffix = query.size > 0 ? `?${query.toString()}` : "";

  return apiRequest<AnonymousQuestionListResponse>(
    `/admin/anonymous-questions${suffix}`,
    {},
    authOptions(),
  );
}

export function answerAnonymousQuestion(
  questionId: number,
  payload: { answer: string; internal_notes?: string | null },
): Promise<AnonymousQuestionResponse> {
  return apiRequest<AnonymousQuestionResponse>(
    `/admin/anonymous-questions/${questionId}/answer`,
    { method: "POST", body: JSON.stringify(payload) },
    authOptions(),
  );
}

export function archiveAnonymousQuestion(questionId: number): Promise<AnonymousQuestionResponse> {
  return apiRequest<AnonymousQuestionResponse>(
    `/admin/anonymous-questions/${questionId}/archive`,
    { method: "POST" },
    authOptions(),
  );
}
