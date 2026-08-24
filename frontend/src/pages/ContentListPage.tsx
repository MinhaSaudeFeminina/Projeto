import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePenLine, Plus, Search } from "lucide-react";
import { EditorialStatusBadge } from "@/components/content/EditorialStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAdminContents, type AdminContent } from "@/services/api/contentApi";

export default function ContentListPage() {
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadContents(filters: { q?: string; status?: string } = {}) {
    setIsLoading(true);
    setError(null);

    try {
      setContents(await listAdminContents(filters));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar os conteúdos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContents();
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadContents({ q: query, status });
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

      <form className="flex flex-col gap-3 rounded border bg-card p-4 sm:flex-row" onSubmit={handleSearch}>
        <label className="sr-only" htmlFor="content-search">Buscar conteúdo</label>
        <Input id="content-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título ou texto" />
        <label className="sr-only" htmlFor="content-status">Estado editorial</label>
        <select id="content-status" className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos os estados</option>
          <option value="draft">Rascunho</option>
          <option value="in_review">Em revisão</option>
          <option value="approved">Aprovado</option>
          <option value="published">Publicado</option>
          <option value="archived">Arquivado</option>
        </select>
        <Button type="submit"><Search className="mr-2 h-4 w-4" />Buscar</Button>
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
                <TableCell><Button asChild variant="outline" size="sm"><Link to={`/conteudos/${content.id}`}>Abrir</Link></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
