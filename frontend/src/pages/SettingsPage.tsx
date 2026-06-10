import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Building2, Palette, FileText, Shield, Plug, Flag } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Configurações gerais do sistema</p>
      </div>

      <Tabs defaultValue="institucional" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="institucional" className="gap-1"><Building2 className="h-3.5 w-3.5" /> Institucional</TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-1"><Palette className="h-3.5 w-3.5" /> Aparência</TabsTrigger>
          <TabsTrigger value="textos" className="gap-1"><FileText className="h-3.5 w-3.5" /> Textos padrão</TabsTrigger>
          <TabsTrigger value="privacidade" className="gap-1"><Shield className="h-3.5 w-3.5" /> Privacidade</TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-1"><Plug className="h-3.5 w-3.5" /> Integrações</TabsTrigger>
          <TabsTrigger value="features" className="gap-1"><Flag className="h-3.5 w-3.5" /> Feature flags</TabsTrigger>
        </TabsList>

        <TabsContent value="institucional">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Dados Institucionais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Nome do aplicativo</Label><Input defaultValue="Minha Saúde Feminina" /></div>
              <div><Label>Slogan</Label><Input defaultValue="Gestão de conteúdos, lembretes e apoio ao cuidado feminino." /></div>
              <div><Label>Logotipo</Label>
                <div className="mt-1 flex h-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                </div>
              </div>
              <Button onClick={() => toast({ title: 'Configurações salvas!' })}>Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Cores do Sistema</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Cor primária</Label><Input type="color" defaultValue="#D64F8C" className="h-10" /></div>
                <div><Label>Cor secundária</Label><Input type="color" defaultValue="#9B59B6" className="h-10" /></div>
                <div><Label>Cor de sucesso</Label><Input type="color" defaultValue="#2ECC71" className="h-10" /></div>
                <div><Label>Cor de alerta</Label><Input type="color" defaultValue="#E67E22" className="h-10" /></div>
              </div>
              <Button onClick={() => toast({ title: 'Cores atualizadas!' })}>Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="textos">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Textos Padrão</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Disclaimer médico padrão</Label><Textarea defaultValue="Este conteúdo é educativo e não substitui avaliação médica. Se os sintomas persistirem ou forem intensos, procure sua UBS." rows={3} /></div>
              <div><Label>Mensagem padrão de respostas a perguntas</Label><Textarea defaultValue="Estas informações não substituem avaliação médica. Se os sintomas persistirem ou forem intensos, procure sua UBS." rows={3} /></div>
              <Button onClick={() => toast({ title: 'Textos salvos!' })}>Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacidade">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Políticas e Termos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Política de Privacidade</Label><Textarea placeholder="Conteúdo da política de privacidade..." rows={6} /></div>
              <Separator />
              <div><Label>Termos de Uso</Label><Textarea placeholder="Conteúdo dos termos de uso..." rows={6} /></div>
              <Button onClick={() => toast({ title: 'Políticas salvas!' })}>Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Integrações Futuras</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 border p-4">
                <p className="text-sm text-muted-foreground">Configurações de API e integrações estarão disponíveis em versões futuras.</p>
              </div>
              <div><Label>URL da API</Label><Input placeholder="https://api.minhasaudefeminina.com/v1" /></div>
              <div><Label>Chave de API</Label><Input placeholder="sk_..." type="password" /></div>
              <div className="flex items-center gap-2"><Switch /><Label>Status do app: Online</Label></div>
              <Button onClick={() => toast({ title: 'Integrações salvas!' })}>Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Feature Flags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                ['Perguntas anônimas', 'Permitir envio de perguntas anônimas no app', true],
                ['Registro de sintomas', 'Permitir registro de sintomas pelas usuárias', true],
                ['Notificações push', 'Enviar notificações push para o app', true],
                ['Chat com profissional', 'Habilitar chat com profissional de saúde', false],
                ['Modo offline', 'Permitir acesso offline aos conteúdos', false],
                ['Gamificação', 'Habilitar sistema de pontos e conquistas', false],
              ].map(([label, desc, active]) => (
                <div key={label as string} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{label as string}</p>
                    <p className="text-xs text-muted-foreground">{desc as string}</p>
                  </div>
                  <Switch defaultChecked={active as boolean} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
