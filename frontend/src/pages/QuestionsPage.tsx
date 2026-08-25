import { useCallback, useEffect, useState } from "react";
import { Search, Eye, MessageCircle, AlertTriangle, Archive } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  answerAnonymousQuestion,
  archiveAnonymousQuestion,
  listAnonymousQuestions,
  type AdminAnonymousQuestion,
  type QuestionPriority,
  type QuestionStatus,
} from "@/services/api/anonymousQuestionApi";

const DISCLAIMER = "Estas informações não substituem avaliação médica. Se os sintomas persistirem ou forem intensos, procure sua UBS.";

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "todos">("todos");
  const [priorityFilter, setPriorityFilter] = useState<QuestionPriority | "todos">("todos");
  const [questions, setQuestions] = useState<AdminAnonymousQuestion[]>([]);
  const [selected, setSelected] = useState<AdminAnonymousQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listAnonymousQuestions({
        q: search,
        status: statusFilter === "todos" ? undefined : statusFilter,
        priority: priorityFilter === "todos" ? undefined : priorityFilter,
      });
      setQuestions(response.data);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [priorityFilter, search, statusFilter]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  function openQuestion(question: AdminAnonymousQuestion) {
    setSelected(question);
    setAnswer(question.answer ?? "");
    setInternalNotes(question.internal_notes ?? "");
    setError(null);
  }

  function closeQuestion() {
    if (isSaving) return;
    setSelected(null);
  }

  function updateQuestion(updated: AdminAnonymousQuestion) {
    setQuestions((current) => current.map((question) => (
      question.id === updated.id ? updated : question
    )));
  }

  async function saveAnswer() {
    if (!selected || !answer.trim()) {
      setError("Informe a resposta orientativa.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await answerAnonymousQuestion(selected.id, {
        answer: answer.trim(),
        internal_notes: internalNotes.trim() || null,
      });
      updateQuestion(response.data);
      setSelected(null);
      toast({ title: "Resposta salva com sucesso!" });
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveQuestion() {
    if (!selected) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await archiveAnonymousQuestion(selected.id);
      updateQuestion(response.data);
      setSelected(null);
      toast({ title: "Pergunta arquivada!" });
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Perguntas Anônimas</h1>
        <p className="text-muted-foreground">Gerencie as perguntas feitas anonimamente no app</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input aria-label="Buscar pergunta" placeholder="Buscar pergunta..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuestionStatus | "todos")}>
          <SelectTrigger className="w-40" aria-label="Filtrar por status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="nova">Nova</SelectItem>
            <SelectItem value="em_analise">Em análise</SelectItem>
            <SelectItem value="respondida">Respondida</SelectItem>
            <SelectItem value="arquivada">Arquivada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as QuestionPriority | "todos")}>
          <SelectTrigger className="w-36" aria-label="Filtrar por prioridade"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && !selected ? <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {isLoading ? <p className="text-sm text-muted-foreground">Carregando perguntas...</p> : null}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pergunta</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && questions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma pergunta encontrada.</TableCell></TableRow>
            ) : null}
            {questions.map((question) => (
              <TableRow key={question.id} className={question.is_sensitive ? "bg-destructive/5" : ""}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    {question.is_sensitive ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-label="Conteúdo sensível" /> : null}
                    <p className="font-medium text-sm truncate max-w-xs">{question.question}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{question.category}</TableCell>
                <TableCell><StatusBadge status={question.status} /></TableCell>
                <TableCell><StatusBadge status={question.priority} type="priority" /></TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(question.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Visualizar pergunta ${question.id}`} onClick={() => openQuestion(question)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Responder pergunta ${question.id}`} onClick={() => openQuestion(question)}><MessageCircle className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) closeQuestion(); }}>
        <DialogContent className="max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>Pergunta #{selected.id}</DialogTitle>
                <DialogDescription>Revise a pergunta e registre uma resposta orientativa.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">{selected.question}</p>
                  <div className="flex gap-2 mt-2">
                    <StatusBadge status={selected.status} />
                    <StatusBadge status={selected.priority} type="priority" />
                    <span className="text-xs text-muted-foreground">{selected.category}</span>
                  </div>
                </div>

                {selected.is_sensitive ? (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" aria-hidden="true" /> Conteúdo sensível</p>
                  </div>
                ) : null}

                {error ? <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

                <div>
                  <Label htmlFor="question-answer">Resposta orientativa</Label>
                  <Textarea id="question-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} rows={4} placeholder="Escreva a resposta orientativa..." disabled={selected.status === "arquivada"} />
                </div>

                <div className="rounded-lg bg-muted/50 border p-3">
                  <p className="text-xs text-muted-foreground italic">⚠️ {DISCLAIMER}</p>
                </div>

                <div>
                  <Label htmlFor="question-notes">Observação interna (não visível para a usuária)</Label>
                  <Textarea id="question-notes" value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={2} placeholder="Notas internas..." disabled={selected.status === "arquivada"} />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" disabled={isSaving || selected.status === "arquivada"} onClick={() => void archiveQuestion()}>
                  <Archive className="h-4 w-4 mr-1" /> Arquivar
                </Button>
                <Button disabled={isSaving || selected.status === "arquivada" || !answer.trim()} onClick={() => void saveAnswer()}>
                  {isSaving ? "Salvando..." : "Salvar resposta"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
