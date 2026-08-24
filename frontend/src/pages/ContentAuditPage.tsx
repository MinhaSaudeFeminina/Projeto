import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileClock } from "lucide-react";
import { EditorialStatusBadge } from "@/components/content/EditorialStatusBadge";
import { Button } from "@/components/ui/button";
import { getAdminContent, type AdminContent } from "@/services/api/contentApi";

type MetadataItemProps = {
  label: string;
  actorId: number | null;
  date: string | null;
  emptyText: string;
};

function formatDate(value: string | null): string | null {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function MetadataItem({ label, actorId, date, emptyText }: MetadataItemProps) {
  const formattedDate = formatDate(date);

  return (
    <div className="rounded border bg-card p-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-medium">{formattedDate ?? emptyText}</dd>
      {actorId ? <dd className="mt-1 text-sm text-muted-foreground">Responsável: usuário #{actorId}</dd> : null}
    </div>
  );
}

export default function ContentAuditPage() {
  const { id } = useParams();
  const [content, setContent] = useState<AdminContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const contentId = Number(id);

    if (!Number.isInteger(contentId) || contentId <= 0) {
      setError("Conteúdo inválido.");
      return;
    }

    getAdminContent(contentId)
      .then(setContent)
      .catch((caught: Error) => setError(caught.message));
  }, [id]);

  if (error) {
    return <p role="alert" className="rounded border border-destructive/30 p-3 text-destructive">{error}</p>;
  }

  if (!content) {
    return <p>Carregando metadados editoriais...</p>;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/conteudos"><ArrowLeft className="mr-2 h-4 w-4" />Voltar aos conteúdos</Link></Button>

      <section className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary"><FileClock className="h-4 w-4" />Rastreabilidade editorial</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">Metadados de publicação</h1>
          <EditorialStatusBadge status={content.status} />
        </div>
        <p className="text-muted-foreground">{content.title}</p>
      </section>

      <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetadataItem label="Autoria" actorId={content.author_id} date={null} emptyText={content.author?.name ?? `Usuário #${content.author_id}`} />
        <MetadataItem label="Envio para revisão" actorId={content.submitted_by} date={content.submitted_at} emptyText="Ainda não enviado para revisão" />
        <MetadataItem label="Revisão" actorId={content.reviewed_by} date={content.reviewed_at} emptyText="Ainda não revisado" />
        <MetadataItem label="Aprovação" actorId={content.approved_by} date={content.approved_at} emptyText="Ainda não aprovado" />
        <MetadataItem label="Publicação" actorId={content.published_by} date={content.published_at} emptyText="Ainda não publicado" />
        <MetadataItem label="Arquivamento" actorId={content.archived_by} date={content.archived_at} emptyText="Ainda não arquivado" />
      </dl>
    </div>
  );
}
