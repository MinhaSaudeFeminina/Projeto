import { useState } from 'react';
import { appUsers, lifeStages } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Eye, Bell, BellOff } from 'lucide-react';
import type { AppUser } from '@/types';

export default function AppUsersPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('todos');
  const [selected, setSelected] = useState<AppUser | null>(null);

  const filtered = appUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'todos' || u.lifeStage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Usuárias / Perfis</h1>
        <p className="text-muted-foreground">Visão administrativa dos perfis do app (dados privados protegidos)</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Fase da vida" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as fases</SelectItem>
            {lifeStages.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Idade</TableHead>
              <TableHead className="hidden md:table-cell">Fase da vida</TableHead>
              <TableHead className="hidden lg:table-cell">Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Notificações</TableHead>
              <TableHead className="hidden md:table-cell">Último acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{u.age}</TableCell>
                <TableCell className="hidden md:table-cell">{u.lifeStage}</TableCell>
                <TableCell className="hidden lg:table-cell">{u.city || '—'}</TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell className="hidden lg:table-cell">
                  {u.notificationsActive ? <Bell className="h-4 w-4 text-success" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(u.lastAccess).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelected(u)}><Eye className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader><SheetTitle>Perfil: {selected.name}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  {[
                    ['Nome', selected.name],
                    ['E-mail', selected.email],
                    ['Idade', `${selected.age} anos`],
                    ['Fase da vida', selected.lifeStage],
                    ['Cidade', selected.city || 'Não informada'],
                    ['Cadastro', new Date(selected.createdAt).toLocaleDateString('pt-BR')],
                    ['Último acesso', new Date(selected.lastAccess).toLocaleDateString('pt-BR')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={selected.status} />
                  {selected.notificationsActive ? (
                    <span className="inline-flex items-center rounded-full bg-success/20 text-success px-2.5 py-0.5 text-xs font-medium">Notificações ativas</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-medium">Notificações desativadas</span>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
