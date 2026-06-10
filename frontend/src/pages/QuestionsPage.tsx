import { useState } from 'react';
import { anonymousQuestions, adminUsers } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, MessageCircle, AlertTriangle, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AnonymousQuestion } from '@/types';

const DISCLAIMER = 'Estas informações não substituem avaliação médica. Se os sintomas persistirem ou forem intensos, procure sua UBS.';

export default function QuestionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todos');
  const [selected, setSelected] = useState<AnonymousQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const { toast } = useToast();

  const filtered = anonymousQuestions.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || q.status === statusFilter;
    const matchPriority = priorityFilter === 'todos' || q.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const openQuestion = (q: AnonymousQuestion) => {
    setSelected(q);
    setAnswer(q.answer || '');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Perguntas Anônimas</h1>
        <p className="text-muted-foreground">Gerencie as perguntas feitas anonimamente no app</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar pergunta..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="nova">Nova</SelectItem>
            <SelectItem value="em_analise">Em análise</SelectItem>
            <SelectItem value="respondida">Respondida</SelectItem>
            <SelectItem value="arquivada">Arquivada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pergunta</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(q => (
              <TableRow key={q.id} className={q.isSensitive ? 'bg-destructive/5' : ''}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    {q.isSensitive && <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                    <p className="font-medium text-sm truncate max-w-xs">{q.question}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{q.category}</TableCell>
                <TableCell><StatusBadge status={q.status} /></TableCell>
                <TableCell><StatusBadge status={q.priority} type="priority" /></TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(q.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openQuestion(q)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openQuestion(q)}><MessageCircle className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader><DialogTitle>Pergunta #{selected.id}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">{selected.question}</p>
                  <div className="flex gap-2 mt-2">
                    <StatusBadge status={selected.status} />
                    <StatusBadge status={selected.priority} type="priority" />
                    <span className="text-xs text-muted-foreground">{selected.category}</span>
                  </div>
                </div>

                {selected.isSensitive && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-xs font-medium text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Conteúdo sensível</p>
                  </div>
                )}

                <div>
                  <Label>Resposta orientativa</Label>
                  <Textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4} placeholder="Escreva a resposta orientativa..." />
                </div>

                <div className="rounded-lg bg-muted/50 border p-3">
                  <p className="text-xs text-muted-foreground italic">⚠️ {DISCLAIMER}</p>
                </div>

                <div>
                  <Label>Observação interna (não visível para a usuária)</Label>
                  <Textarea defaultValue={selected.internalNotes} rows={2} placeholder="Notas internas..." />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => { setSelected(null); toast({ title: 'Arquivada!' }); }}>
                  <Archive className="h-4 w-4 mr-1" /> Arquivar
                </Button>
                <Button onClick={() => { setSelected(null); toast({ title: 'Resposta salva com sucesso!' }); }}>
                  Salvar resposta
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
