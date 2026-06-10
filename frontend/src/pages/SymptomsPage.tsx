import { useState } from 'react';
import { symptoms } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SymptomsPage() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<typeof symptoms[0] | null>(null);
  const { toast } = useToast();

  const filtered = symptoms.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sintomas e Queixas</h1>
          <p className="text-muted-foreground">Gerencie os sintomas exibidos no app para registro pelas usuárias</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Novo sintoma</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar sintoma..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>No app</TableHead>
              <TableHead className="hidden lg:table-cell">Intensidade</TableHead>
              <TableHead className="hidden lg:table-cell">Alerta UBS</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.shortDescription}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell capitalize">{s.type}</TableCell>
                <TableCell className="hidden md:table-cell">{s.category}</TableCell>
                <TableCell><Switch checked={s.showInApp} /></TableCell>
                <TableCell className="hidden lg:table-cell"><Switch checked={s.askIntensity} /></TableCell>
                <TableCell className="hidden lg:table-cell">
                  {s.generateUbsAlert && <span className="inline-flex items-center rounded-full bg-destructive/20 text-destructive px-2 py-0.5 text-xs font-medium">Sim</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(s)}><Edit className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          {editing && (
            <>
              <DialogHeader><DialogTitle>Editar: {editing.name}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input defaultValue={editing.name} /></div>
                <div><Label>Descrição curta</Label><Input defaultValue={editing.shortDescription} /></div>
                <div><Label>Descrição explicativa</Label><Textarea defaultValue={editing.fullDescription} rows={3} /></div>
                <div><Label>Texto de orientação</Label><Textarea defaultValue={editing.orientationText} rows={3} /></div>
                <div><Label>Sinais de gravidade</Label><Textarea defaultValue={editing.severityAlertText} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Switch defaultChecked={editing.showInApp} /><Label>Exibir no app</Label></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked={editing.askIntensity} /><Label>Pedir intensidade</Label></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked={editing.askNotes} /><Label>Pedir observações</Label></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked={editing.generateUbsAlert} /><Label>Gerar alerta UBS</Label></div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setEditing(null); toast({ title: 'Sintoma atualizado!' }); }}>Salvar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
