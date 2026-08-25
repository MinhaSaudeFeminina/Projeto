import { EditorialStatusBadge } from "@/components/content/EditorialStatusBadge";
import type { EditorialAuditEvent } from "@/services/api/auditApi";

const actionLabels: Record<string, string> = {
  content_created: "Conteúdo criado",
  content_updated: "Conteúdo editado",
  submitted_for_review: "Enviado para revisão",
  adjustments_requested: "Ajustes solicitados",
  approved: "Conteúdo aprovado",
  published: "Conteúdo publicado",
  archived: "Conteúdo arquivado",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AuditTimeline({ events }: { events: EditorialAuditEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum evento de auditoria registrado.</p>;
  }

  return (
    <ol className="space-y-4" aria-label="Linha do tempo da auditoria editorial">
      {events.map((event) => (
        <li key={event.id} className="relative border-l-2 border-primary/30 pl-5">
          <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" aria-hidden="true" />
          <div className="rounded border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{actionLabels[event.action] ?? event.action}</h3>
              <time className="text-sm text-muted-foreground" dateTime={event.occurred_at}>{formatDate(event.occurred_at)}</time>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Responsável: {event.actor?.name ?? (event.actor_id ? `usuário #${event.actor_id}` : "sistema")}
            </p>
            {event.previous_status || event.new_status ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {event.previous_status ? <EditorialStatusBadge status={event.previous_status} /> : null}
                {event.previous_status && event.new_status ? <span aria-hidden="true">→</span> : null}
                {event.new_status ? <EditorialStatusBadge status={event.new_status} /> : null}
              </div>
            ) : null}
            {event.comment ? <p className="mt-3 rounded bg-muted p-3 text-sm">Comentário: {event.comment}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
