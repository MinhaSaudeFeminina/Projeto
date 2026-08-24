import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import { ReviewActionDialog, type ReviewDecision } from "@/components/content/ReviewActionDialog";
import { EditorialStatusBadge } from "@/components/content/EditorialStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAdminContents, type AdminContent } from "@/services/api/contentApi";
import { approveContent, requestContentAdjustments } from "@/services/api/editorialApi";

export default function ReviewQueuePage() {
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<AdminContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    listAdminContents({ status: "in_review" })
      .then((records) => {
        if (mounted) setContents(records);
      })
      .catch((caught: Error) => {
        if (mounted) setError(caught.message);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  async function handleDecision(decision: ReviewDecision, comment?: string) {
    if (!selectedContent) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (decision === "approve") {
        await approveContent(selectedContent.id, comment);
      } else {
        await requestContentAdjustments(selectedContent.id, comment ?? "");
      }

      setContents((current) => current.filter((content) => content.id !== selectedContent.id));
      setSelectedContent(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível registrar a decisão editorial.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary"><ClipboardCheck className="h-4 w-4" />Fluxo editorial</div>
        <h1 className="text-2xl font-bold">Fila de revisão</h1>
        <p className="text-muted-foreground">Revise conteúdos, solicite ajustes fundamentados ou aprove materiais adequados.</p>
      </section>

      {error ? <p role="alert" className="rounded border border-destructive/30 p-3 text-destructive">{error}</p> : null}

      <section className="overflow-hidden rounded border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Autoria</TableHead><TableHead>Estado</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5}>Carregando fila de revisão...</TableCell></TableRow> : null}
            {!isLoading && contents.length === 0 ? <TableRow><TableCell colSpan={5}>Nenhum conteúdo aguardando revisão.</TableCell></TableRow> : null}
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell><p className="font-medium">{content.title}</p><p className="max-w-md truncate text-sm text-muted-foreground">{content.summary}</p></TableCell>
                <TableCell>{content.category?.name ?? "—"}</TableCell>
                <TableCell>{content.author?.name ?? "—"}</TableCell>
                <TableCell><EditorialStatusBadge status={content.status} /></TableCell>
                <TableCell className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => setSelectedContent(content)}>Revisar conteúdo</Button>
                  <Button asChild variant="outline" size="sm"><Link to={`/conteudos/${content.id}`}>Ver detalhes</Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {selectedContent ? (
        <ReviewActionDialog
          contentTitle={selectedContent.title}
          isSubmitting={isSubmitting}
          open
          onOpenChange={(open) => { if (!open) setSelectedContent(null); }}
          onConfirm={handleDecision}
        />
      ) : null}
    </div>
  );
}
