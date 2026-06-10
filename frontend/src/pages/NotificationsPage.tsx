import { useState } from 'react';
import { notifications } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Plus, Eye, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState<Notification | null>(null);
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Envie e agende notificações para o app</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="h-4 w-4" /> Nova notificação</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Público</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Entrega</TableHead>
              <TableHead className="hidden lg:table-cell">Abertura</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map(n => (
              <TableRow key={n.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{n.message}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{n.audience}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{n.category}</TableCell>
                <TableCell><StatusBadge status={n.status} /></TableCell>
                <TableCell className="hidden lg:table-cell">
                  {n.deliveryRate ? (
                    <div className="flex items-center gap-2">
                      <Progress value={n.deliveryRate} className="w-16 h-2" />
                      <span className="text-xs">{n.deliveryRate}%</span>
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {n.openRate ? <span className="text-sm">{n.openRate}%</span> : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setDetail(n)}><Eye className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* New notification dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova Notificação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input placeholder="Título da notificação" /></div>
            <div><Label>Mensagem</Label><Textarea placeholder="Mensagem" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Segmento</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as usuárias</SelectItem>
                    <SelectItem value="adolescentes">Adolescentes</SelectItem>
                    <SelectItem value="fase_adulta">Fase adulta</SelectItem>
                    <SelectItem value="gestantes">Gestantes</SelectItem>
                    <SelectItem value="climaterio">Climatério/menopausa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Agendamento</Label><Input type="datetime-local" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Botão (CTA)</Label><Input placeholder="Ex: Saiba mais" /></div>
              <div><Label>Link interno</Label><Input placeholder="/conteudo/1" /></div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowNew(false); toast({ title: 'Rascunho salvo!' }); }}>Salvar rascunho</Button>
            <Button variant="outline" onClick={() => { setShowNew(false); toast({ title: 'Teste enviado!' }); }}><Send className="h-4 w-4 mr-1" /> Enviar teste</Button>
            <Button onClick={() => { setShowNew(false); toast({ title: 'Notificação agendada!' }); }}>Agendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.title}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <p className="text-sm">{detail.message}</p>
                <div className="flex gap-2">
                  <StatusBadge status={detail.status} />
                  <span className="text-xs text-muted-foreground">{detail.audience} • {detail.category}</span>
                </div>
                {detail.deliveryRate && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Taxa de entrega</span><span>{detail.deliveryRate}%</span></div>
                    <Progress value={detail.deliveryRate} className="h-2" />
                    <div className="flex justify-between text-sm"><span>Taxa de abertura</span><span>{detail.openRate}%</span></div>
                    <Progress value={detail.openRate} className="h-2" />
                  </div>
                )}
                {detail.ctaLabel && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">CTA: <strong>{detail.ctaLabel}</strong> → {detail.ctaLink}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
