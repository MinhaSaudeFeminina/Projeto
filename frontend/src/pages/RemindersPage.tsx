import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Edit, Loader2, Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createReminder,
  duplicateReminder,
  listReminders,
  updateReminder,
  type Reminder,
  type ReminderPayload,
  type ReminderPriority,
  type ReminderType,
} from "@/services/api/reminderApi";

const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: "exame_preventivo", label: "Exame preventivo" },
  { value: "mamografia", label: "Mamografia" },
  { value: "vacina_hpv", label: "Vacina HPV" },
  { value: "consulta", label: "Consulta" },
  { value: "medicamento", label: "Medicamento" },
  { value: "menstruacao", label: "Menstruação" },
  { value: "autoexame", label: "Autoexame" },
  { value: "campanha", label: "Campanha" },
];

const REMINDER_PRIORITIES: { value: ReminderPriority; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

type ReminderFormState = {
  title: string;
  description: string;
  type: ReminderType;
  priority: ReminderPriority;
  audience: string;
  periodicity: string;
  start_date: string;
  end_date: string;
  short_message: string;
  expanded_message: string;
  is_active: boolean;
};

const emptyForm: ReminderFormState = {
  title: "",
  description: "",
  type: "exame_preventivo",
  priority: "media",
  audience: "",
  periodicity: "",
  start_date: "",
  end_date: "",
  short_message: "",
  expanded_message: "",
  is_active: true,
};

function typeLabel(type: ReminderType): string {
  return REMINDER_TYPES.find((option) => option.value === type)?.label ?? type;
}

export default function RemindersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReminderType | "todos">("todos");
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState<ReminderFormState>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /** A busca é feita no servidor; o atraso evita uma requisição por tecla. */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);

    return () => clearTimeout(timer);
  }, [search]);

  const remindersQuery = useQuery({
    queryKey: ["reminders", debouncedSearch, typeFilter],
    queryFn: () => listReminders({
      q: debouncedSearch || undefined,
      type: typeFilter === "todos" ? undefined : typeFilter,
    }),
  });

  const reminders = remindersQuery.data ?? [];

  function reportError(title: string) {
    return (error: unknown) => {
      toast({
        title,
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    };
  }

  async function refreshList() {
    await queryClient.invalidateQueries({ queryKey: ["reminders"] });
  }

  const saveMutation = useMutation({
    mutationFn: (payload: ReminderPayload) => editingReminder
      ? updateReminder(editingReminder.id, payload)
      : createReminder(payload),
    onSuccess: async () => {
      await refreshList();
      closeForm();
      toast({ title: editingReminder ? "Lembrete atualizado!" : "Lembrete criado!" });
    },
    onError: reportError("Não foi possível salvar"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => updateReminder(id, { is_active: isActive }),
    onSuccess: refreshList,
    onError: reportError("Não foi possível alterar a situação"),
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateReminder,
    onSuccess: async () => {
      await refreshList();
      toast({ title: "Lembrete duplicado!", description: "A cópia começa inativa para revisão." });
    },
    onError: reportError("Não foi possível duplicar"),
  });

  function closeForm() {
    setShowForm(false);
    setEditingReminder(null);
    setForm(emptyForm);
  }

  function openNewForm() {
    setEditingReminder(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(reminder: Reminder) {
    setEditingReminder(reminder);
    setForm({
      title: reminder.title,
      description: reminder.description ?? "",
      type: reminder.type,
      priority: reminder.priority,
      audience: reminder.audience,
      periodicity: reminder.periodicity,
      start_date: reminder.start_date,
      end_date: reminder.end_date ?? "",
      short_message: reminder.short_message,
      expanded_message: reminder.expanded_message,
      is_active: reminder.is_active,
    });
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveMutation.mutate({
      ...form,
      description: form.description.trim() === "" ? null : form.description,
      end_date: form.end_date === "" ? null : form.end_date,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lembretes e Campanhas</h1>
          <p className="text-muted-foreground">Gerencie lembretes inteligentes e campanhas de saúde</p>
        </div>
        <Button onClick={openNewForm} className="gap-2"><Plus className="h-4 w-4" /> Novo lembrete</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar lembretes"
            placeholder="Buscar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ReminderType | "todos")}>
          <SelectTrigger className="w-48" aria-label="Filtrar por tipo"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {REMINDER_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {remindersQuery.isError ? (
        <p role="alert" className="rounded border border-destructive/30 p-3 text-destructive">
          {remindersQuery.error instanceof Error ? remindersQuery.error.message : "Não foi possível carregar os lembretes."}
        </p>
      ) : null}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Público</TableHead>
              <TableHead className="hidden lg:table-cell">Periodicidade</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {remindersQuery.isPending ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-label="Carregando lembretes" />
                </TableCell>
              </TableRow>
            ) : null}

            {!remindersQuery.isPending && reminders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Nenhum lembrete encontrado.
                </TableCell>
              </TableRow>
            ) : null}

            {reminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{reminder.short_message}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{typeLabel(reminder.type)}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{reminder.audience}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{reminder.periodicity}</TableCell>
                <TableCell><StatusBadge status={reminder.priority} type="priority" /></TableCell>
                <TableCell>
                  <Switch
                    checked={reminder.is_active}
                    aria-label={`Ativar ${reminder.title}`}
                    disabled={toggleMutation.isPending}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: reminder.id, isActive: checked })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Editar ${reminder.title}`} onClick={() => openEditForm(reminder)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Duplicar ${reminder.title}`}
                      disabled={duplicateMutation.isPending}
                      onClick={() => duplicateMutation.mutate(reminder.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => (open ? setShowForm(true) : closeForm())}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReminder ? "Editar lembrete" : "Novo Lembrete / Campanha"}</DialogTitle>
            <DialogDescription>
              As mensagens são exibidas às usuárias no aplicativo. Revise a acentuação antes de salvar.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as ReminderType })}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REMINDER_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value as ReminderPriority })}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REMINDER_PRIORITIES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="audience">Público-alvo</Label>
              <Input id="audience" required placeholder="Ex: Mulheres 25-64 anos" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} />
            </div>

            <div>
              <Label htmlFor="periodicity">Periodicidade</Label>
              <Input id="periodicity" required placeholder="Ex: Anual" value={form.periodicity} onChange={(event) => setForm({ ...form, periodicity: event.target.value })} />
            </div>

            <div>
              <Label htmlFor="short_message">Mensagem curta</Label>
              <Input id="short_message" required maxLength={160} placeholder="Mensagem exibida no app" value={form.short_message} onChange={(event) => setForm({ ...form, short_message: event.target.value })} />
            </div>

            <div>
              <Label htmlFor="expanded_message">Mensagem expandida</Label>
              <Textarea id="expanded_message" required rows={3} placeholder="Mensagem completa" value={form.expanded_message} onChange={(event) => setForm({ ...form, expanded_message: event.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data inicial</Label>
                <Input id="start_date" type="date" required value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="end_date">Data final</Label>
                <Input id="end_date" type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="is_active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              <Label htmlFor="is_active">Ativo</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
