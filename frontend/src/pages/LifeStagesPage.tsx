import { lifeStages, contents } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, FileText, AlertTriangle, Building2 } from 'lucide-react';

export default function LifeStagesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Trilhas por Fase da Vida</h1>
        <p className="text-muted-foreground">Organize jornadas de conteúdo para cada perfil</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {lifeStages.map(stage => {
          const stageContents = contents.filter(c => c.lifeStageId === stage.id);
          return (
            <Card key={stage.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  </div>
                  <StatusBadge status={stage.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{stageContents.length} conteúdos vinculados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span>{stage.warningSignals.length} sinais de atenção</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-info" />
                  <span className="truncate">{stage.ubsOrientation}</span>
                </div>

                {stage.reminderSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {stage.reminderSuggestions.map((r, i) => (
                      <span key={i} className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs">
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1"><Edit className="h-3 w-3" /> Editar</Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1"><Eye className="h-3 w-3" /> Visualizar</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
