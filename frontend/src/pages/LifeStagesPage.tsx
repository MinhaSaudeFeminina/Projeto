import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Building2, Edit, Eye, FileText, Loader2, Plus, X } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  listLifeStageTracks,
  updateLifeStageTrack,
  type LifeStageTrack,
  type LifeStageTrackPayload,
} from "@/services/api/lifeStageApi";

type TrackFormState = {
  name: string;
  description: string;
  ubs_orientation: string;
  warning_signals: string[];
  reminder_suggestions: string[];
  is_active: boolean;
};

/** A tela usa o vocabulário editorial do painel para a situação da trilha. */
function trackStatus(track: LifeStageTrack): string {
  return track.is_active ? "publicado" : "rascunho";
}

function toFormState(track: LifeStageTrack): TrackFormState {
  return {
    name: track.name,
    description: track.description ?? "",
    ubs_orientation: track.ubs_orientation ?? "",
    warning_signals: [...track.warning_signals],
    reminder_suggestions: [...track.reminder_suggestions],
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
  const [form, setForm] = useState<TrackFormState | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tracksQuery = useQuery({
    queryKey: ["life-stage-tracks"],
    queryFn: listLifeStageTracks,
  });

  const tracks = tracksQuery.data ?? [];

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LifeStageTrackPayload> }) =>
      updateLifeStageTrack(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["life-stage-tracks"] });
      closeEditor();
      toast({ title: "Trilha atualizada!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível salvar",
        description: error instanceof Error ? error.message : "Confira os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  function closeEditor() {
    setEditingTrack(null);
    setForm(null);
  }

  function openEditor(track: LifeStageTrack) {
    setEditingTrack(track);
    setForm(toFormState(track));
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
      },
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Trilhas por Fase da Vida</h1>
        <p className="text-muted-foreground">Organize jornadas de conteúdo para cada perfil</p>
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
                <StatusBadge status={trackStatus(track)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" aria-label={`Editar ${track.name}`} onClick={() => openEditor(track)}>
                  <Edit className="h-3 w-3" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1" aria-label={`Visualizar ${track.name}`} onClick={() => setViewingTrack(track)}>
                  <Eye className="h-3 w-3" /> Visualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <Label htmlFor="is_active">Trilha publicada</Label>
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
                <StatusBadge status={trackStatus(viewingTrack)} />
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
