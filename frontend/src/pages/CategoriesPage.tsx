import { useState } from 'react';
import { categories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CategoriesPage() {
  const [showNew, setShowNew] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias de conteúdo</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="h-4 w-4" /> Nova categoria</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(c => (
              <TableRow key={c.id}>
                <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.description}</TableCell>
                <TableCell><div className="h-6 w-6 rounded-full border" style={{ backgroundColor: c.color }} /></TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {c.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input placeholder="Nome da categoria" /></div>
            <div><Label>Descrição</Label><Input placeholder="Descrição breve" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cor</Label><Input type="color" defaultValue="#E91E63" className="h-10" /></div>
              <div><Label>Ordem</Label><Input type="number" placeholder="1" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked /><Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowNew(false); toast({ title: 'Categoria criada!' }); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
