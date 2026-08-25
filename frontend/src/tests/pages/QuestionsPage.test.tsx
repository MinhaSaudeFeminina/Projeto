import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import QuestionsPage from "@/pages/QuestionsPage";
import {
  answerAnonymousQuestion,
  archiveAnonymousQuestion,
  listAnonymousQuestions,
} from "@/services/api/anonymousQuestionApi";

vi.mock("@/services/api/anonymousQuestionApi", () => ({
  listAnonymousQuestions: vi.fn(),
  answerAnonymousQuestion: vi.fn(),
  archiveAnonymousQuestion: vi.fn(),
}));

const question = {
  id: 1,
  question: "Meu corrimento mudou de cor, isso é normal?",
  category: "Saúde íntima",
  status: "nova" as const,
  priority: "media" as const,
  answer: null,
  internal_notes: null,
  is_sensitive: false,
  answered_by: null,
  answered_at: null,
  archived_by: null,
  archived_at: null,
  created_at: "2026-08-25T12:00:00.000Z",
  updated_at: "2026-08-25T12:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listAnonymousQuestions).mockResolvedValue({
    data: [question],
    meta: { current_page: 1, last_page: 1, total: 1 },
  });
});

test("carrega perguntas da API e persiste a resposta orientativa", async () => {
  const answeredQuestion = {
    ...question,
    status: "respondida" as const,
    answer: "Procure sua UBS para uma avaliação.",
    answered_by: 2,
    answered_at: "2026-08-25T13:00:00.000Z",
  };
  vi.mocked(answerAnonymousQuestion).mockResolvedValue({ data: answeredQuestion });

  render(<QuestionsPage />);

  expect(await screen.findByText(question.question)).toBeInTheDocument();
  expect(listAnonymousQuestions).toHaveBeenCalledWith({
    q: "",
    status: undefined,
    priority: undefined,
  });

  fireEvent.click(screen.getByRole("button", { name: "Responder pergunta 1" }));
  fireEvent.change(screen.getByLabelText("Resposta orientativa"), {
    target: { value: "Procure sua UBS para uma avaliação." },
  });
  fireEvent.change(screen.getByLabelText("Observação interna (não visível para a usuária)"), {
    target: { value: "Revisada pela equipe." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar resposta" }));

  await waitFor(() => expect(answerAnonymousQuestion).toHaveBeenCalledWith(1, {
    answer: "Procure sua UBS para uma avaliação.",
    internal_notes: "Revisada pela equipe.",
  }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("arquiva a pergunta pela API", async () => {
  vi.mocked(archiveAnonymousQuestion).mockResolvedValue({
    data: {
      ...question,
      status: "arquivada",
      archived_by: 1,
      archived_at: "2026-08-25T13:00:00.000Z",
    },
  });

  render(<QuestionsPage />);

  fireEvent.click(await screen.findByRole("button", { name: "Visualizar pergunta 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Arquivar" }));

  await waitFor(() => expect(archiveAnonymousQuestion).toHaveBeenCalledWith(1));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
