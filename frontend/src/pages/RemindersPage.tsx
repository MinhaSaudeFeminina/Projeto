import { useState } from 'react';
import { reminders } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Copy, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RemindersPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [showNew, setShowNew] = useState(false);
  const { toast } = useToast();

  const filtered = reminders.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'todos' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lembretes e Campanhas</h1>
          <p className="text-muted-foreground">Gerencie lembretes inteligentes e campanhas de saúde</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="h-4 w-4" /> Novo lembrete</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="exame_preventivo">Exame preventivo</SelectItem>
            <SelectItem value="mamografia">Mamografia</SelectItem>
            <SelectItem value="vacina_hpv">Vacina HPV</SelectItem>
            <SelectItem value="campanha">Campanha</SelectItem>
            <SelectItem value="autoexame">Autoexame</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Público</TableHead>
              <TableHead className="hidden lg:table-cell">Periodicidade</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{r.shortMessage}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell capitalize">{r.type.replace(/_/g, ' ')}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{r.audience}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{r.periodicity}</TableCell>
                <TableCell><StatusBadge status={r.priority} type="priority" /></TableCell>
                <TableCell><Switch checked={r.isActive} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Lembrete duplicado!' })}><Copy className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Lembrete / Campanha</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input placeholder="Título do lembrete" /></div>
            <div><Label>Descrição</Label><Textarea placeholder="Descrição" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exame_preventivo">Exame preventivo</SelectItem>
                    <SelectItem value="mamografia">Mamografia</SelectItem>
                    <SelectItem value="campanha">Campanha</SelectItem>
                    <SelectItem value="autoexame">Autoexame</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Prioridade</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Público-alvo</Label><Input placeholder="Ex: Mulheres 25-64 anos" /></div>
            <div><Label>Mensagem curta</Label><Input placeholder="Mensagem exibida no app" /></div>
            <div><Label>Mensagem expandida</Label><Textarea placeholder="Mensagem completa" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data inicial</Label><Input type="date" /></div>
              <div><Label>Data final</Label><Input type="date" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowNew(false); toast({ title: 'Lembrete criado!' }); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
