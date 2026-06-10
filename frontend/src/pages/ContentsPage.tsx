import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contents, categories, lifeStages } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, Copy, Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ContentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [showNew, setShowNew] = useState(false);
  const [previewContent, setPreviewContent] = useState<typeof contents[0] | null>(null);
  const { toast } = useToast();

  const filtered = contents.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    const matchCategory = categoryFilter === 'todos' || c.categoryId === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '';
  const getLifeStageName = (id: string) => lifeStages.find(l => l.id === id)?.name || '';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Conteúdos Educativos</h1>
          <p className="text-muted-foreground">Gerencie os conteúdos exibidos no app</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="h-4 w-4" /> Novo conteúdo</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por título..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="em_revisao">Em revisão</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden lg:table-cell">Fase da vida</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Atualizado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{c.summary}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{getCategoryName(c.categoryId)}</TableCell>
                <TableCell className="hidden lg:table-cell">{getLifeStageName(c.lifeStageId)}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.updatedAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewContent(c)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowNew(true)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Conteúdo duplicado!' })}><Copy className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum conteúdo encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Content Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Conteúdo Educativo</DialogTitle>
            <DialogDescription>Preencha os campos para criar um novo conteúdo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Título</Label><Input placeholder="Título do conteúdo" /></div>
              <div><Label>Categoria</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Fase da vida</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{lifeStages.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Resumo</Label><Textarea placeholder="Breve descrição do conteúdo" rows={2} /></div>
            <div><Label>Texto principal</Label><Textarea placeholder="Conteúdo educativo completo..." rows={6} /></div>
            <div><Label>O que é normal</Label><Textarea placeholder="Descreva o que é considerado normal..." rows={3} /></div>
            <div><Label>Quando procurar a UBS</Label><Textarea placeholder="Orientações para buscar atendimento..." rows={3} /></div>
            <div><Label>O que você pode fazer em casa</Label><Textarea placeholder="Dicas de cuidado em casa..." rows={3} /></div>
            <div><Label>Disclaimer médico</Label><Textarea placeholder="Este conteúdo é educativo e não substitui avaliação médica." rows={2} /></div>
            <div><Label>Tags (separadas por vírgula)</Label><Input placeholder="saúde, mulher, orientação" /></div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowNew(false); toast({ title: 'Rascunho salvo!' }); }}>Salvar rascunho</Button>
            <Button variant="outline" onClick={() => { setShowNew(false); toast({ title: 'Enviado para revisão!' }); }}>Enviar para revisão</Button>
            <Button onClick={() => { setShowNew(false); toast({ title: 'Conteúdo publicado!' }); }}>Aprovar e publicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {previewContent && (
            <>
              <DialogHeader>
                <DialogTitle>{previewContent.title}</DialogTitle>
                <DialogDescription>{previewContent.summary}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <StatusBadge status={previewContent.status} />
                  <span className="text-xs text-muted-foreground">{getCategoryName(previewContent.categoryId)}</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: previewContent.body }} />
                </div>
                <div className="rounded-lg bg-success/10 p-4">
                  <h4 className="font-semibold text-sm text-success mb-1">✅ O que é normal</h4>
                  <p className="text-sm">{previewContent.normalText}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-4">
                  <h4 className="font-semibold text-sm mb-1">🏥 Quando procurar a UBS</h4>
                  <p className="text-sm">{previewContent.ubsText}</p>
                </div>
                <div className="rounded-lg bg-info/10 p-4">
                  <h4 className="font-semibold text-sm text-info mb-1">🏠 O que você pode fazer em casa</h4>
                  <p className="text-sm">{previewContent.homeCareText}</p>
                </div>
                <div className="rounded-lg bg-muted p-4 border">
                  <p className="text-xs text-muted-foreground italic">⚠️ {previewContent.disclaimer}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
