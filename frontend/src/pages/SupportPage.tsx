import { useState } from 'react';
import { supportContacts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Phone, ExternalLink, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SupportPage() {
  const [showNew, setShowNew] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Apoio e Contatos Úteis</h1>
          <p className="text-muted-foreground">Gerencie informações de apoio exibidas no app</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="h-4 w-4" /> Novo contato</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {supportContacts.map(c => (
          <Card key={c.id} className={`shadow-sm hover:shadow-md transition-shadow ${c.isHighlighted ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {c.isHighlighted && <Star className="h-4 w-4 text-primary fill-primary" />}
                  {c.name}
                </CardTitle>
                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{c.description}</p>
              {c.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium">{c.phone}</span>
                </div>
              )}
              {c.link && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-info" />
                  <a href={c.link} className="text-info hover:underline truncate">{c.link}</a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Button size="sm" variant={c.isHighlighted ? 'default' : 'outline'}>
                  {c.ctaLabel}
                </Button>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {c.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Contato</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome do serviço</Label><Input placeholder="Ex: Central 180" /></div>
            <div><Label>Descrição</Label><Input placeholder="Descrição do serviço" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefone</Label><Input placeholder="Ex: 180" /></div>
              <div><Label>Link</Label><Input placeholder="https://..." /></div>
            </div>
            <div><Label>Tipo</Label><Input placeholder="Ex: emergência, apoio" /></div>
            <div><Label>Botão de ação</Label><Input placeholder="Ex: Ligar agora" /></div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch /><Label>Destaque</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Ativo</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowNew(false); toast({ title: 'Contato salvo!' }); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
