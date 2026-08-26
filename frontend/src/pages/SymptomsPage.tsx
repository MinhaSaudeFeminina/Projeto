import { type FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createAdminSymptom,
  deleteAdminSymptom,
  listAdminSymptoms,
  type AdminSymptom,
  type AdminSymptomPayload,
  updateAdminSymptom,
} from "@/services/api/symptomApi";
import { hasAdminRole } from "@/state/adminAuthStore";

type SymptomFormState = {
  name: string;
  type: string;
  short_description: string;
  full_description: string;
  icon: string;
  category: string;
  show_in_app: boolean;
  ask_intensity: boolean;
  ask_notes: boolean;
  generate_ubs_alert: boolean;
  orientation_text: string;
  severity_alert_text: string;
  sort_order: string;
};

const emptyForm: SymptomFormState = {
  name: "",
  type: "",
  short_description: "",
  full_description: "",
  icon: "",
  category: "",
  show_in_app: true,
  ask_intensity: true,
  ask_notes: true,
  generate_ubs_alert: false,
  orientation_text: "",
  severity_alert_text: "",
  sort_order: "0",
};

function formFromSymptom(symptom: AdminSymptom): SymptomFormState {
  return {
    name: symptom.name,
    type: symptom.type,
    short_description: symptom.short_description ?? "",
    full_description: symptom.full_description ?? "",
    icon: symptom.icon ?? "",
    category: symptom.category,
    show_in_app: symptom.show_in_app,
    ask_intensity: symptom.ask_intensity,
    ask_notes: symptom.ask_notes,
    generate_ubs_alert: symptom.generate_ubs_alert,
    orientation_text: symptom.orientation_text ?? "",
    severity_alert_text: symptom.severity_alert_text ?? "",
    sort_order: String(symptom.sort_order),
  };
}

function payloadFromForm(form: SymptomFormState): AdminSymptomPayload {
  return {
    name: form.name.trim(),
    type: form.type.trim(),
    short_description: form.short_description.trim(),
    full_description: form.full_description.trim() || null,
    icon: form.icon.trim() || null,
    category: form.category.trim(),
    show_in_app: form.show_in_app,
    ask_intensity: form.ask_intensity,
    ask_notes: form.ask_notes,
    generate_ubs_alert: form.generate_ubs_alert,
    orientation_text: form.orientation_text.trim() || null,
    severity_alert_text: form.severity_alert_text.trim() || null,
    sort_order: Number(form.sort_order || 0),
  };
}

type ToggleVariables = {
  id: number;
  changes: Partial<AdminSymptomPayload>;
};

export default function SymptomsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<AdminSymptom | null>(null);
  const [form, setForm] = useState<SymptomFormState>(emptyForm);
  const isAdmin = hasAdminRole("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const symptomsQuery = useQuery({
    queryKey: ["admin-symptoms", search],
    queryFn: () => listAdminSymptoms({ q: search }),
  });

  function showMutationError(title: string) {
    return (error: unknown) => {
      toast({
        title,
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    };
  }

  function closeForm() {
    setShowForm(false);
    setEditingSymptom(null);
    setForm(emptyForm);
  }

  const saveMutation = useMutation({
    mutationFn: (payload: AdminSymptomPayload) => editingSymptom
      ? updateAdminSymptom(editingSymptom.id, payload)
      : createAdminSymptom(payload),
    onSuccess: async () => {
      const wasEditing = editingSymptom !== null;
      await queryClient.invalidateQueries({ queryKey: ["admin-symptoms"] });
      closeForm();
      toast({ title: wasEditing ? "Sintoma atualizado!" : "Sintoma criado!" });
    },
    onError: showMutationError("Não foi possível salvar"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, changes }: ToggleVariables) => updateAdminSymptom(id, changes),
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-symptoms"] });
      const previous = queryClient.getQueriesData<AdminSymptom[]>({ queryKey: ["admin-symptoms"] });

      queryClient.setQueriesData<AdminSymptom[]>({ queryKey: ["admin-symptoms"] }, (items) =>
        items?.map((item) => item.id === id ? { ...item, ...changes } : item),
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      showMutationError("Não foi possível atualizar")(error);
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<AdminSymptom[]>({ queryKey: ["admin-symptoms"] }, (items) =>
        items?.map((item) => item.id === updated.id ? updated : item),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-symptoms"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminSymptom,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-symptoms"] });
      toast({ title: "Sintoma excluído!" });
    },
    onError: showMutationError("Não foi possível excluir"),
  });

  function openNewForm() {
    setEditingSymptom(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(symptom: AdminSymptom) {
    setEditingSymptom(symptom);
    setForm(formFromSymptom(symptom));
    setShowForm(true);
  }

  function handleDialogChange(open: boolean) {
    if (open) setShowForm(true);
    else closeForm();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate(payloadFromForm(form));
  }

  function handleDelete(symptom: AdminSymptom) {
    if (window.confirm(`Excluir o sintoma ou queixa "${symptom.name}"?`)) {
      deleteMutation.mutate(symptom.id);
    }
  }

  function toggle(id: number, changes: Partial<AdminSymptomPayload>) {
    if (isAdmin) toggleMutation.mutate({ id, changes });
  }

  const items = symptomsQuery.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sintomas e Queixas</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de sintomas disponibilizado nos canais do produto</p>
        </div>
        {isAdmin && (
          <Button onClick={openNewForm} className="gap-2">
            <Plus className="h-4 w-4" /> Novo sintoma
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar sintoma..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>No app</TableHead>
              <TableHead className="hidden lg:table-cell">Intensidade</TableHead>
              <TableHead className="hidden lg:table-cell">Alerta UBS</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {symptomsQuery.isLoading && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground"><span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando sintomas</span></TableCell></TableRow>
            )}
            {symptomsQuery.isError && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-destructive">Não foi possível carregar os sintomas e queixas.</TableCell></TableRow>
            )}
            {!symptomsQuery.isLoading && !symptomsQuery.isError && items.map((symptom) => (
              <TableRow key={symptom.id}>
                <TableCell><div><p className="font-medium">{symptom.name}</p><p className="text-xs text-muted-foreground">{symptom.short_description}</p></div></TableCell>
                <TableCell className="hidden capitalize md:table-cell">{symptom.type}</TableCell>
                <TableCell className="hidden md:table-cell">{symptom.category}</TableCell>
                <TableCell><Switch checked={symptom.show_in_app} onCheckedChange={(checked) => toggle(symptom.id, { show_in_app: checked })} disabled={!isAdmin || toggleMutation.isPending} aria-label={`Exibir ${symptom.name} no app`} /></TableCell>
                <TableCell className="hidden lg:table-cell"><Switch checked={symptom.ask_intensity} onCheckedChange={(checked) => toggle(symptom.id, { ask_intensity: checked })} disabled={!isAdmin || toggleMutation.isPending} aria-label={`Pedir intensidade para ${symptom.name}`} /></TableCell>
                <TableCell className="hidden lg:table-cell"><Switch checked={symptom.generate_ubs_alert} onCheckedChange={(checked) => toggle(symptom.id, { generate_ubs_alert: checked })} disabled={!isAdmin || toggleMutation.isPending} aria-label={`Alerta UBS para ${symptom.name}`} /></TableCell>
                <TableCell className="text-right">
                  {isAdmin ? (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(symptom)} aria-label={`Editar ${symptom.name}`}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(symptom)} aria-label={`Excluir ${symptom.name}`} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">Somente leitura</span>}
                </TableCell>
              </TableRow>
            ))}
            {!symptomsQuery.isLoading && !symptomsQuery.isError && items.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhum sintoma ou queixa encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSymptom ? `Editar: ${editingSymptom.name}` : "Novo sintoma ou queixa"}</DialogTitle>
            <DialogDescription>Configure como o item será apresentado e quais informações poderão ser solicitadas.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="symptom-name">Nome</Label><Input id="symptom-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div>
              <div className="grid gap-2"><Label htmlFor="symptom-type">Tipo</Label><Input id="symptom-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} required /></div>
              <div className="grid gap-2"><Label htmlFor="symptom-category">Categoria</Label><Input id="symptom-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></div>
              <div className="grid gap-2"><Label htmlFor="symptom-order">Ordem</Label><Input id="symptom-order" type="number" min={0} max={9999} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} required /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="symptom-short-description">Descrição curta</Label><Input id="symptom-short-description" value={form.short_description} onChange={(event) => setForm({ ...form, short_description: event.target.value })} required /></div>
            <div className="grid gap-2"><Label htmlFor="symptom-full-description">Descrição explicativa</Label><Textarea id="symptom-full-description" value={form.full_description} onChange={(event) => setForm({ ...form, full_description: event.target.value })} rows={3} /></div>
            <div className="grid gap-2"><Label htmlFor="symptom-orientation">Texto de orientação</Label><Textarea id="symptom-orientation" value={form.orientation_text} onChange={(event) => setForm({ ...form, orientation_text: event.target.value })} rows={3} /></div>
            <div className="grid gap-2"><Label htmlFor="symptom-severity">Sinais de gravidade</Label><Textarea id="symptom-severity" value={form.severity_alert_text} onChange={(event) => setForm({ ...form, severity_alert_text: event.target.value })} rows={2} /></div>
            <div className="grid gap-2"><Label htmlFor="symptom-icon">Ícone</Label><Input id="symptom-icon" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} placeholder="Nome técnico opcional" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2"><Switch id="symptom-show" checked={form.show_in_app} onCheckedChange={(checked) => setForm({ ...form, show_in_app: checked })} /><Label htmlFor="symptom-show">Exibir no app</Label></div>
              <div className="flex items-center gap-2"><Switch id="symptom-intensity" checked={form.ask_intensity} onCheckedChange={(checked) => setForm({ ...form, ask_intensity: checked })} /><Label htmlFor="symptom-intensity">Pedir intensidade</Label></div>
              <div className="flex items-center gap-2"><Switch id="symptom-notes" checked={form.ask_notes} onCheckedChange={(checked) => setForm({ ...form, ask_notes: checked })} /><Label htmlFor="symptom-notes">Pedir observações</Label></div>
              <div className="flex items-center gap-2"><Switch id="symptom-alert" checked={form.generate_ubs_alert} onCheckedChange={(checked) => setForm({ ...form, generate_ubs_alert: checked })} /><Label htmlFor="symptom-alert">Gerar alerta UBS</Label></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
