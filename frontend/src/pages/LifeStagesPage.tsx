import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Archive,
  Building2,
  Edit,
  Eye,
  FileText,
  ListOrdered,
  Loader2,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { listAdminContents } from "@/services/api/contentApi";
import {
  archiveLifeStageTrack,
  createLifeStageTrack,
  deleteLifeStageTrack,
  getLifeStageTrack,
  listLifeStageTracks,
  publishLifeStageTrack,
  syncLifeStageTrackContents,
  updateLifeStageTrack,
  type LifeStageTrack,
  type LifeStageTrackPayload,
  type LifeStageTrackStatus,
} from "@/services/api/lifeStageApi";
import { listTaxonomies } from "@/services/api/taxonomyApi";
import { hasAdminRole } from "@/state/adminAuthStore";

type TrackFormState = {
  name: string;
  description: string;
  ubs_orientation: string;
  warning_signals: string[];
  reminder_suggestions: string[];
  age_range_id: string;
  is_active: boolean;
};

type CreateFormState = {
  name: string;
  description: string;
  age_range_id: string;
};

/** A tela usa o vocabulário editorial do painel para a situação da trilha. */
function trackStatus(status: LifeStageTrackStatus): string {
  if (status === "published") {
    return "publicado";
  }

  return status === "archived" ? "arquivado" : "rascunho";
}

function toFormState(track: LifeStageTrack): TrackFormState {
  return {
    name: track.name,
    description: track.description ?? "",
    ubs_orientation: track.ubs_orientation ?? "",
    warning_signals: [...track.warning_signals],
    reminder_suggestions: [...track.reminder_suggestions],
    age_range_id: track.age_range_id === null ? "" : String(track.age_range_id),
    is_active: track.is_active,
  };
}

type StringListFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
};

/** Editor de lista simples: cada item vira uma etiqueta removível. */
function StringListField({ id, label, placeholder, values, onChange }: StringListFieldProps) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const item = draft.trim();

    if (item === "" || values.includes(item)) {
      setDraft("");

      return;
    }

    onChange([...values, item]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter aqui adiciona o item, sem enviar o formulário inteiro.
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" aria-label={`Adicionar em ${label}`} onClick={addItem}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {values.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {values.map((value) => (
            <li key={value} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs">
              {value}
              <button
                type="button"
                aria-label={`Remover ${value}`}
                onClick={() => onChange(values.filter((item) => item !== value))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Nenhum item cadastrado.</p>
      )}
    </div>
  );
}

export default function LifeStagesPage() {
  const [editingTrack, setEditingTrack] = useState<LifeStageTrack | null>(null);
  const [viewingTrack, setViewingTrack] = useState<LifeStageTrack | null>(null);
  const [linkingTrack, setLinkingTrack] = useState<LifeStageTrack | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TrackFormState | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>({ name: "", description: "", age_range_id: "" });
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // A publicação leva a trilha ao app, então fica com o admin e o professor/revisor.
  const canEdit = hasAdminRole("admin");
  const canPublish = canEdit || hasAdminRole("reviewer_professor");

  const tracksQuery = useQuery({
    queryKey: ["life-stage-tracks"],
    queryFn: listLifeStageTracks,
  });

  const taxonomiesQuery = useQuery({
    queryKey: ["content-taxonomies"],
    queryFn: listTaxonomies,
  });

  // As faixas etárias são as mesmas da tela de novo conteúdo.
  const ageRanges = taxonomiesQuery.data?.age_ranges ?? [];
  const tracks = tracksQuery.data ?? [];

  const trackDetailQuery = useQuery({
    queryKey: ["life-stage-track", linkingTrack?.id],
    queryFn: () => getLifeStageTrack(linkingTrack!.id),
    enabled: linkingTrack !== null,
  });

  // Só conteúdos da faixa etária da trilha entram no seletor de vínculo.
  const linkableQuery = useQuery({
    queryKey: ["life-stage-linkable-contents", linkingTrack?.age_range_id],
    queryFn: () => listAdminContents(
      linkingTrack?.age_range_id ? { ageRangeId: linkingTrack.age_range_id } : {},
    ),
    enabled: linkingTrack !== null,
  });

  useEffect(() => {
    if (trackDetailQuery.data) {
      setOrderedIds((trackDetailQuery.data.contents ?? []).map((content) => content.id));
    }
  }, [trackDetailQuery.data]);

  /** Um id vinculado pode não estar na lista da faixa etária; o detalhe cobre o nome. */
  const contentTitles = useMemo(() => {
    const titles = new Map<number, string>();

    for (const content of trackDetailQuery.data?.contents ?? []) {
      titles.set(content.id, content.title);
    }

    for (const content of linkableQuery.data ?? []) {
      titles.set(content.id, content.title);
    }

    return titles;
  }, [trackDetailQuery.data, linkableQuery.data]);

  const availableContents = (linkableQuery.data ?? []).filter(
    (content) => !orderedIds.includes(content.id) && content.status !== "archived",
  );

  function invalidateTracks() {
    return queryClient.invalidateQueries({ queryKey: ["life-stage-tracks"] });
  }

  function reportError(error: unknown, title: string) {
    toast({
      title,
      description: error instanceof Error ? error.message : "Confira os dados e tente novamente.",
      variant: "destructive",
    });
  }

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LifeStageTrackPayload> }) =>
      updateLifeStageTrack(id, payload),
    onSuccess: async () => {
      await invalidateTracks();
      closeEditor();
      toast({ title: "Trilha atualizada!" });
    },
    onError: (error) => reportError(error, "Não foi possível salvar"),
  });

  const createMutation = useMutation({
    mutationFn: createLifeStageTrack,
    onSuccess: async () => {
      await invalidateTracks();
      setCreating(false);
      setCreateForm({ name: "", description: "", age_range_id: "" });
      toast({ title: "Trilha criada em rascunho!", description: "Ela só aparece no app depois de publicada." });
    },
    onError: (error) => reportError(error, "Não foi possível criar a trilha"),
  });

  const publishMutation = useMutation({
    mutationFn: publishLifeStageTrack,
    onSuccess: async () => {
      await invalidateTracks();
      toast({ title: "Trilha publicada!", description: "Agora ela aparece no aplicativo." });
    },
    onError: (error) => reportError(error, "Não foi possível publicar"),
  });

  const archiveMutation = useMutation({
    mutationFn: archiveLifeStageTrack,
    onSuccess: async () => {
      await invalidateTracks();
      toast({ title: "Trilha arquivada." });
    },
    onError: (error) => reportError(error, "Não foi possível arquivar"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLifeStageTrack,
    onSuccess: async () => {
      await invalidateTracks();
      toast({ title: "Trilha excluída." });
    },
    onError: (error) => reportError(error, "Não foi possível excluir"),
  });

  const linkMutation = useMutation({
    mutationFn: ({ id, contentIds }: { id: number; contentIds: number[] }) =>
      syncLifeStageTrackContents(id, contentIds),
    onSuccess: async () => {
      await invalidateTracks();
      setLinkingTrack(null);
      toast({ title: "Conteúdos vinculados!" });
    },
    onError: (error) => reportError(error, "Não foi possível vincular os conteúdos"),
  });

  function closeEditor() {
    setEditingTrack(null);
    setForm(null);
  }

  function openEditor(track: LifeStageTrack) {
    setEditingTrack(track);
    setForm(toFormState(track));
  }

  function moveContent(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= orderedIds.length) {
      return;
    }

    const reordered = [...orderedIds];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setOrderedIds(reordered);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTrack || !form) {
      return;
    }

    saveMutation.mutate({
      id: editingTrack.id,
      payload: {
        ...form,
        description: form.description.trim() === "" ? null : form.description,
        ubs_orientation: form.ubs_orientation.trim() === "" ? null : form.ubs_orientation,
        age_range_id: form.age_range_id === "" ? null : Number(form.age_range_id),
      },
    });
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createForm.age_range_id === "") {
      toast({ title: "Escolha a faixa etária da trilha", variant: "destructive" });

      return;
    }

    createMutation.mutate({
      name: createForm.name,
      description: createForm.description.trim() === "" ? null : createForm.description,
      age_range_id: Number(createForm.age_range_id),
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Trilhas por Fase da Vida</h1>
          <p className="text-muted-foreground">Organize jornadas de conteúdo para cada perfil</p>
        </div>
        {canEdit ? (
          <Button className="gap-1" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Nova trilha
          </Button>
        ) : null}
      </div>

      {tracksQuery.isError ? (
        <p role="alert" className="rounded border border-destructive/30 p-3 text-destructive">
          {tracksQuery.error instanceof Error ? tracksQuery.error.message : "Não foi possível carregar as trilhas."}
        </p>
      ) : null}

      {tracksQuery.isPending ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Carregando trilhas" />
        </div>
      ) : null}

      {!tracksQuery.isPending && tracks.length === 0 ? (
        <p className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
          Nenhuma trilha cadastrada.
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {tracks.map((track) => (
          <Card key={track.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{track.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
                </div>
                <StatusBadge status={trackStatus(track.status)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>{track.age_range ? `Faixa etária ${track.age_range.label}` : "Sem faixa etária definida"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span>{track.contents_count} conteúdos vinculados</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>{track.warning_signals.length} sinais de atenção</span>
              </div>
              {track.ubs_orientation ? (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-info" />
                  <span className="truncate">{track.ubs_orientation}</span>
                </div>
              ) : null}

              {track.reminder_suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {track.reminder_suggestions.map((suggestion) => (
                    <span key={suggestion} className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs">
                      {suggestion}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                {canEdit && track.status !== "archived" ? (
                  <Button variant="outline" size="sm" className="flex-1 gap-1" aria-label={`Editar ${track.name}`} onClick={() => openEditor(track)}>
                    <Edit className="h-3 w-3" /> Editar
                  </Button>
                ) : null}
                {canEdit && track.status !== "archived" ? (
                  <Button variant="outline" size="sm" className="flex-1 gap-1" aria-label={`Vincular conteúdos em ${track.name}`} onClick={() => setLinkingTrack(track)}>
                    <ListOrdered className="h-3 w-3" /> Conteúdos
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" className="flex-1 gap-1" aria-label={`Visualizar ${track.name}`} onClick={() => setViewingTrack(track)}>
                  <Eye className="h-3 w-3" /> Visualizar
                </Button>
              </div>

              {canPublish ? (
                <div className="flex flex-wrap gap-2">
                  {track.status !== "published" ? (
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      aria-label={`Publicar ${track.name}`}
                      disabled={publishMutation.isPending}
                      onClick={() => publishMutation.mutate(track.id)}
                    >
                      <Send className="h-3 w-3" /> Publicar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      aria-label={`Arquivar ${track.name}`}
                      disabled={archiveMutation.isPending}
                      onClick={() => archiveMutation.mutate(track.id)}
                    >
                      <Archive className="h-3 w-3" /> Arquivar
                    </Button>
                  )}
                  {canEdit && track.status === "draft" && track.contents_count === 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive"
                      aria-label={`Excluir ${track.name}`}
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(track.id)}
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={creating} onOpenChange={(open) => (open ? null : setCreating(false))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova trilha</DialogTitle>
            <DialogDescription>
              A trilha nasce em rascunho. Ela só aparece no aplicativo depois de publicada por um
              admin ou professor/revisor.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <Label htmlFor="new_name">Nome</Label>
              <Input
                id="new_name"
                required
                value={createForm.name}
                onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="new_description">Descrição</Label>
              <Textarea
                id="new_description"
                rows={2}
                value={createForm.description}
                onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="new_age_range">Faixa etária</Label>
              <Select
                value={createForm.age_range_id}
                onValueChange={(value) => setCreateForm({ ...createForm, age_range_id: value })}
              >
                <SelectTrigger id="new_age_range" aria-label="Faixa etária da trilha">
                  <SelectValue placeholder="Selecione a faixa etária" />
                </SelectTrigger>
                <SelectContent>
                  {ageRanges.map((range) => (
                    <SelectItem key={range.id} value={String(range.id)}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar rascunho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editingTrack !== null} onOpenChange={(open) => (open ? null : closeEditor())}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar trilha</DialogTitle>
            <DialogDescription>
              O conteúdo orienta usuárias em uma fase da vida. Revise a acentuação antes de salvar.
            </DialogDescription>
          </DialogHeader>

          {form ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>

              <div>
                <Label htmlFor="age_range">Faixa etária</Label>
                <Select value={form.age_range_id} onValueChange={(value) => setForm({ ...form, age_range_id: value })}>
                  <SelectTrigger id="age_range" aria-label="Faixa etária"><SelectValue placeholder="Selecione a faixa etária" /></SelectTrigger>
                  <SelectContent>
                    {ageRanges.map((range) => (
                      <SelectItem key={range.id} value={String(range.id)}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ubs_orientation">Orientação da UBS</Label>
                <Textarea id="ubs_orientation" rows={2} value={form.ubs_orientation} onChange={(event) => setForm({ ...form, ubs_orientation: event.target.value })} />
              </div>

              <StringListField
                id="warning_signals"
                label="Sinais de atenção"
                placeholder="Ex: Sangramento fora do período"
                values={form.warning_signals}
                onChange={(warning_signals) => setForm({ ...form, warning_signals })}
              />

              <StringListField
                id="reminder_suggestions"
                label="Sugestões de lembrete"
                placeholder="Ex: Mamografia bienal"
                values={form.reminder_suggestions}
                onChange={(reminder_suggestions) => setForm({ ...form, reminder_suggestions })}
              />

              <div className="flex items-center gap-2">
                <Switch id="is_active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                <Label htmlFor="is_active">Disponível para marcar conteúdos</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEditor}>Cancelar</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={linkingTrack !== null} onOpenChange={(open) => (open ? null : setLinkingTrack(null))}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conteúdos de {linkingTrack?.name}</DialogTitle>
            <DialogDescription>
              {linkingTrack?.age_range
                ? `A lista abaixo traz conteúdos da faixa etária ${linkingTrack.age_range.label}. A ordem é a que a usuária vai percorrer.`
                : "Defina a faixa etária da trilha para filtrar os conteúdos. A ordem é a que a usuária vai percorrer."}
            </DialogDescription>
          </DialogHeader>

          {trackDetailQuery.isPending || linkableQuery.isPending ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Carregando conteúdos" />
            </div>
          ) : (
            <div className="space-y-5">
              <section className="space-y-2">
                <h3 className="font-medium">Na trilha ({orderedIds.length})</h3>
                {orderedIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum conteúdo vinculado ainda.</p>
                ) : (
                  <ol className="space-y-2">
                    {orderedIds.map((id, index) => (
                      <li key={id} className="flex items-center gap-2 rounded border p-2 text-sm">
                        <span className="w-6 text-center text-muted-foreground">{index + 1}</span>
                        <span className="flex-1">{contentTitles.get(id) ?? `Conteúdo ${id}`}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Subir ${contentTitles.get(id) ?? id}`}
                          disabled={index === 0}
                          onClick={() => moveContent(index, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Descer ${contentTitles.get(id) ?? id}`}
                          disabled={index === orderedIds.length - 1}
                          onClick={() => moveContent(index, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remover ${contentTitles.get(id) ?? id} da trilha`}
                          onClick={() => setOrderedIds(orderedIds.filter((current) => current !== id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="font-medium">Disponíveis ({availableContents.length})</h3>
                {availableContents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum conteúdo disponível para esta faixa etária.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {availableContents.map((content) => (
                      <li key={content.id} className="flex items-center gap-2 rounded border p-2 text-sm">
                        <span className="flex-1">{content.title}</span>
                        <StatusBadge status={content.status === "published" ? "publicado" : "rascunho"} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Vincular ${content.title}`}
                          onClick={() => setOrderedIds([...orderedIds, content.id])}
                        >
                          <Plus className="h-3 w-3" /> Vincular
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkingTrack(null)}>Cancelar</Button>
            <Button
              type="button"
              disabled={linkMutation.isPending || linkingTrack === null}
              onClick={() => linkingTrack && linkMutation.mutate({ id: linkingTrack.id, contentIds: orderedIds })}
            >
              {linkMutation.isPending ? "Salvando..." : "Salvar ordem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewingTrack !== null} onOpenChange={(open) => (open ? null : setViewingTrack(null))}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingTrack?.name}</DialogTitle>
            <DialogDescription>{viewingTrack?.description ?? "Trilha sem descrição."}</DialogDescription>
          </DialogHeader>

          {viewingTrack ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Situação</p>
                <StatusBadge status={trackStatus(viewingTrack.status)} />
              </div>

              <div>
                <p className="font-medium">Faixa etária</p>
                <p className="text-muted-foreground">{viewingTrack.age_range?.label ?? "Não definida."}</p>
              </div>

              <div>
                <p className="font-medium">Conteúdos vinculados</p>
                <p className="text-muted-foreground">{viewingTrack.contents_count}</p>
              </div>

              <div>
                <p className="font-medium">Orientação da UBS</p>
                <p className="text-muted-foreground">{viewingTrack.ubs_orientation ?? "Não informada."}</p>
              </div>

              <div>
                <p className="font-medium">Sinais de atenção</p>
                {viewingTrack.warning_signals.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {viewingTrack.warning_signals.map((signal) => <li key={signal}>{signal}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">Nenhum cadastrado.</p>}
              </div>

              <div>
                <p className="font-medium">Sugestões de lembrete</p>
                {viewingTrack.reminder_suggestions.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {viewingTrack.reminder_suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">Nenhuma cadastrada.</p>}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
