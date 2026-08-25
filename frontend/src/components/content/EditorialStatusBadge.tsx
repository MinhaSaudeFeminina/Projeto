import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  approved: "Aprovado",
  published: "Publicado",
  archived: "Arquivado",
};

export function EditorialStatusBadge({ status }: { status: string }) {
  const label = statusLabels[status] ?? status;

  return <Badge variant={status === "archived" ? "secondary" : "default"} aria-label={`Estado editorial: ${label}`}>{label}</Badge>;
}
