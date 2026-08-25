import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpenCheck, Send, Save } from "lucide-react";
import { EditorialStatusBadge } from "@/components/content/EditorialStatusBadge";
import { ReviewActionDialog, type ReviewDecision } from "@/components/content/ReviewActionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createDraftContent,
  getAdminContent,
  updateDraftContent,
  type AdminContent,
  type ContentPayload,
} from "@/services/api/contentApi";
import { approveContent, requestContentAdjustments, submitContentForReview } from "@/services/api/editorialApi";
import { listTaxonomies, type ContentTaxonomies } from "@/services/api/taxonomyApi";
import { hasAdminRole } from "@/state/adminAuthStore";

const emptyForm: ContentPayload = {
  title: "",
  summary: "",
  body: "",
  category_id: 0,
  life_stage_ids: [],
  age_range_ids: [],
};

export default function ContentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editingId = id && id !== "novo" ? Number(id) : null;
  const [content, setContent] = useState<AdminContent | null>(null);
  const [form, setForm] = useState<ContentPayload>(emptyForm);
  const [taxonomies, setTaxonomies] = useState<ContentTaxonomies>({ categories: [], life_stages: [], age_ranges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([listTaxonomies(), editingId ? getAdminContent(editingId) : Promise.resolve(null)])
      .then(([taxonomyData, contentRecord]) => {
        if (!mounted) return;
        setTaxonomies(taxonomyData);
        setContent(contentRecord);
        setForm(contentRecord ? {
          title: contentRecord.title,
          summary: contentRecord.summary,
          body: contentRecord.body,
          category_id: contentRecord.category_id,
          life_stage_ids: contentRecord.life_stages.map((item) => item.id),
          age_range_ids: contentRecord.age_ranges.map((item) => item.id),
        } : { ...emptyForm, category_id: taxonomyData.categories[0]?.id ?? 0 });
      })
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setIsLoading(false));

    return () => { mounted = false; };
  }, [editingId]);

  const isEditable = !content || content.status === "draft";
  const canSubmitReview = content?.status === "draft" && (hasAdminRole("academic_author") || hasAdminRole("admin"));
  const canReview = content?.status === "in_review" && (hasAdminRole("reviewer_professor") || hasAdminRole("admin"));

  function toggleId(field: "life_stage_ids" | "age_range_ids", value: number) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((idValue) => idValue !== value)
        : [...current[field], value],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingId) setContent(await updateDraftContent(editingId, form));
      else await createDraftContent(form);
      navigate("/conteudos");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar o conteúdo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitReview() {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    try {
      setContent(await submitContentForReview(content.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível enviar o conteúdo para revisão.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReviewDecision(decision: ReviewDecision, comment?: string) {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = decision === "approve"
        ? await approveContent(content.id, comment)
        : await requestContentAdjustments(content.id, comment ?? "");
      setContent(updated);
      setReviewDialogOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível registrar a decisão editorial.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary"><BookOpenCheck className="h-4 w-4" />Produção editorial</div>
          <h1 className="text-2xl font-bold">{editingId ? "Editar conteúdo educativo" : "Novo conteúdo educativo"}</h1>
          <p className="text-muted-foreground">Revise a ortografia e a acentuação antes de salvar.</p>
        </div>
        {content ? <EditorialStatusBadge status={content.status} /> : null}
      </section>

      {error ? <p role="alert" className="rounded border border-destructive/30 p-3 text-destructive">{error}</p> : null}
      {isLoading ? <p>Carregando editor...</p> : null}

      <form className="space-y-5 rounded border bg-card p-5" onSubmit={handleSubmit}>
        <div className="grid gap-2"><Label htmlFor="title">Título</Label><Input id="title" disabled={!isEditable} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></div>
        <div className="grid gap-2"><Label htmlFor="summary">Resumo</Label><Textarea id="summary" disabled={!isEditable} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required /></div>
        <div className="grid gap-2"><Label htmlFor="body">Conteúdo educativo</Label><Textarea id="body" disabled={!isEditable} rows={12} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required /></div>
        <div className="grid gap-2"><Label htmlFor="category">Categoria</Label><select id="category" disabled={!isEditable} className="h-10 rounded-md border bg-background px-3" value={form.category_id || ""} onChange={(event) => setForm({ ...form, category_id: Number(event.target.value) })} required><option value="" disabled>Selecione uma categoria</option>{taxonomies.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>

        <fieldset disabled={!isEditable} className="space-y-2"><legend className="font-medium">Fases da vida</legend><div className="grid gap-2 sm:grid-cols-2">{taxonomies.life_stages.map((stage) => <label key={stage.id} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.life_stage_ids.includes(stage.id)} onChange={() => toggleId("life_stage_ids", stage.id)} />{stage.name}</label>)}</div></fieldset>
        <fieldset disabled={!isEditable} className="space-y-2"><legend className="font-medium">Faixas etárias</legend><div className="grid gap-2 sm:grid-cols-3">{taxonomies.age_ranges.map((range) => <label key={range.id} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.age_range_ids.includes(range.id)} onChange={() => toggleId("age_range_ids", range.id)} />{range.label}</label>)}</div></fieldset>

        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild type="button" variant="outline"><Link to="/conteudos">Voltar</Link></Button>
          {isEditable ? <Button type="submit" disabled={isSaving || isLoading || !form.category_id}><Save className="mr-2 h-4 w-4" />{isSaving ? "Salvando..." : "Salvar rascunho"}</Button> : null}
          {canSubmitReview ? <Button type="button" disabled={isSaving} onClick={() => void handleSubmitReview()}><Send className="mr-2 h-4 w-4" />Enviar para revisão</Button> : null}
          {canReview ? <Button type="button" disabled={isSaving} onClick={() => setReviewDialogOpen(true)}>Registrar revisão</Button> : null}
        </div>
      </form>

      {content ? <ReviewActionDialog contentTitle={content.title} isSubmitting={isSaving} open={reviewDialogOpen} onOpenChange={setReviewDialogOpen} onConfirm={handleReviewDecision} /> : null}
    </div>
  );
}
