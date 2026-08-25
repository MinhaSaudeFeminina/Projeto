import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, FileClock, FilePenLine, Plus, Search, Send } from "lucide-react";
import { ContentFilters, type ContentFilterValues } from "@/components/content/ContentFilters";
import { ContentSearchInput } from "@/components/content/ContentSearchInput";
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
import { listAdminContents, type AdminContent, type ContentListFilters } from "@/services/api/contentApi";
import { archiveContent, publishContent } from "@/services/api/editorialApi";
import { listTaxonomies, type ContentTaxonomies } from "@/services/api/taxonomyApi";
import { getAdminUser, hasAdminRole } from "@/state/adminAuthStore";

const emptyFilters: ContentFilterValues = {
  status: "",
  categoryId: "",
  lifeStageId: "",
  ageRangeId: "",
  authorId: "",
};

const emptyTaxonomies: ContentTaxonomies = {
  categories: [],
  life_stages: [],
  age_ranges: [],
};

function optionalId(value: string): number | undefined {
  const parsed = Number(value);
  return value !== "" && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default function ContentListPage() {
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ContentFilterValues>(emptyFilters);
  const [taxonomies, setTaxonomies] = useState<ContentTaxonomies>(emptyTaxonomies);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const currentUser = getAdminUser();
  const isAdmin = hasAdminRole("admin");
  const isReviewer = hasAdminRole("reviewer_professor");

  async function loadContents(searchFilters: ContentListFilters = {}) {
    setIsLoading(true);
    setError(null);

    try {
      setContents(await listAdminContents(searchFilters));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar os conteúdos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContents();
    listTaxonomies().then(setTaxonomies).catch(() => undefined);
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadContents({
      q: query || undefined,
      status: filters.status || undefined,
      categoryId: optionalId(filters.categoryId),
      lifeStageId: optionalId(filters.lifeStageId),
      ageRangeId: optionalId(filters.ageRangeId),
      authorId: optionalId(filters.authorId),
    });
  }

  async function handleEditorialAction(content: AdminContent, action: "publish" | "archive") {
    const actionKey = `${action}-${content.id}`;
    setPendingAction(actionKey);
    setError(null);

    try {
      const updated = action === "publish"
        ? await publishContent(content.id)
        : await archiveContent(content.id);
      setContents((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível concluir a ação editorial.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <FilePenLine className="h-4 w-4" /> Gestão editorial
          </div>
          <h1 className="text-2xl font-bold">Conteúdos educativos</h1>
          <p className="text-muted-foreground">Crie rascunhos e acompanhe seu estado editorial.</p>
        </div>
        <Button asChild><Link to="/conteudos/novo"><Plus className="mr-2 h-4 w-4" />Novo conteúdo</Link></Button>
      </section>

      <form className="grid gap-3 rounded border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6" onSubmit={handleSearch}>
        <ContentSearchInput value={query} onChange={setQuery} />
        <ContentFilters values={filters} taxonomies={taxonomies} onChange={setFilters} />
        <Button type="submit" className="self-end lg:col-start-6">
          <Search className="mr-2 h-4 w-4" />Buscar
        </Button>
      </form>

      {error ? <p role="alert" className="rounded border border-destructive/30 p-3 text-destructive">{error}</p> : null}

      <section className="overflow-hidden rounded border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Estado</TableHead><TableHead>Autoria</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5}>Carregando conteúdos...</TableCell></TableRow> : null}
            {!isLoading && contents.length === 0 ? <TableRow><TableCell colSpan={5}>Nenhum conteúdo encontrado.</TableCell></TableRow> : null}
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell><p className="font-medium">{content.title}</p><p className="max-w-md truncate text-sm text-muted-foreground">{content.summary}</p></TableCell>
                <TableCell>{content.category?.name}</TableCell>
                <TableCell><EditorialStatusBadge status={content.status} /></TableCell>
                <TableCell>{content.author?.name ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm"><Link to={`/conteudos/${content.id}`}>Abrir</Link></Button>
                    {isAdmin || isReviewer || content.author_id === currentUser?.id ? (
                      <Button asChild variant="ghost" size="sm"><Link to={`/conteudos/${content.id}/auditoria`}><FileClock className="mr-1 h-4 w-4" />Auditoria</Link></Button>
                    ) : null}
                    {isAdmin && content.status === "approved" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={pendingAction !== null}
                        onClick={() => void handleEditorialAction(content, "publish")}
                      >
                        <Send className="mr-1 h-4 w-4" />
                        {pendingAction === `publish-${content.id}` ? "Publicando..." : "Publicar"}
                      </Button>
                    ) : null}
                    {isAdmin && content.status === "published" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={pendingAction !== null}
                        onClick={() => void handleEditorialAction(content, "archive")}
                      >
                        <Archive className="mr-1 h-4 w-4" />
                        {pendingAction === `archive-${content.id}` ? "Arquivando..." : "Arquivar"}
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
