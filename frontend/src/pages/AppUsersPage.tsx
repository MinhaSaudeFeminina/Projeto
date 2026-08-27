import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { listAppUsers, updateAppUser, type AppUserPayload, type ManagedAppUser } from "@/services/api/appUserApi";
import { listTaxonomies } from "@/services/api/taxonomyApi";
import { Bell, BellOff, Edit, Loader2, Search } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  birth_date: string;
  life_stage_id: string;
  notifications_active: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  birth_date: "",
  life_stage_id: "none",
  notifications_active: true,
  is_active: true,
};

export default function AppUsersPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("todos");
  const [editingUser, setEditingUser] = useState<ManagedAppUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usersQuery = useQuery({
    queryKey: ["app-users"],
    queryFn: listAppUsers,
  });

  const taxonomiesQuery = useQuery({
    queryKey: ["taxonomies"],
    queryFn: listTaxonomies,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: AppUserPayload) => {
      if (!editingUser) {
        throw new Error("Nenhuma usuária selecionada.");
      }

      return updateAppUser(editingUser.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["app-users"] });
      setEditingUser(null);
      setForm(emptyForm);
      toast({ title: "Usuária atualizada!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível salvar",
        description: error instanceof Error ? error.message : "Confira os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const lifeStages = taxonomiesQuery.data?.life_stages ?? [];

  const filtered = useMemo(() => users.filter((u) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchSearch = !normalizedSearch
      || u.name.toLowerCase().includes(normalizedSearch)
      || u.email.toLowerCase().includes(normalizedSearch);
    const matchStage = stageFilter === "todos" || String(u.life_stage_id ?? "") === stageFilter;
    return matchSearch && matchStage;
  }), [search, stageFilter, users]);

  function openEditForm(user: ManagedAppUser) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      birth_date: user.birth_date ?? "",
      life_stage_id: user.life_stage_id ? String(user.life_stage_id) : "none",
      notifications_active: user.notifications_active,
      is_active: user.is_active,
    });
  }

  function toPayload(): AppUserPayload {
    return {
      name: form.name.trim(),
      email: form.email.trim(),
      birth_date: form.birth_date || null,
      life_stage_id: form.life_stage_id === "none" ? null : Number(form.life_stage_id),
      notifications_active: form.notifications_active,
      is_active: form.is_active,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate(toPayload());
  }

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
            {lifeStages.map((lifeStage) => (
              <SelectItem key={lifeStage.id} value={String(lifeStage.id)}>{lifeStage.name}</SelectItem>
            ))}
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
            {usersQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando usuárias cadastradas
                  </span>
                </TableCell>
              </TableRow>
            ) : null}
            {usersQuery.isError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-destructive">Não foi possível carregar as usuárias.</TableCell>
              </TableRow>
            ) : null}
            {!usersQuery.isLoading && !usersQuery.isError && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>Nenhuma usuária encontrada.</TableCell>
              </TableRow>
            ) : null}
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{u.age ?? "—"}</TableCell>
                <TableCell className="hidden md:table-cell">{u.life_stage ?? "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">—</TableCell>
                <TableCell><StatusBadge status={u.is_active ? "ativo" : "inativo"} /></TableCell>
                <TableCell className="hidden lg:table-cell">
                  {u.notifications_active ? <Bell className="h-4 w-4 text-success" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {u.last_access_at ? new Date(u.last_access_at).toLocaleDateString("pt-BR") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditForm(u)} aria-label={`Editar ${u.name}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuária</DialogTitle>
            <DialogDescription className="sr-only">
              Atualize dados do perfil e bloqueie o login ao inativar a conta.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="app-user-name">Nome</Label>
              <Input id="app-user-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="app-user-email">E-mail</Label>
              <Input id="app-user-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="app-user-birth-date">Data de nascimento</Label>
                <Input id="app-user-birth-date" type="date" value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="app-user-life-stage">Fase da vida</Label>
                <Select value={form.life_stage_id} onValueChange={(value) => setForm({ ...form, life_stage_id: value })}>
                  <SelectTrigger id="app-user-life-stage"><SelectValue placeholder="Fase da vida" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informada</SelectItem>
                    {lifeStages.map((lifeStage) => (
                      <SelectItem key={lifeStage.id} value={String(lifeStage.id)}>{lifeStage.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-md border p-3">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="app-user-notifications">Notificações ativas</Label>
                <Switch id="app-user-notifications" checked={form.notifications_active} onCheckedChange={(checked) => setForm({ ...form, notifications_active: checked })} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="app-user-active">Conta ativa</Label>
                <Switch id="app-user-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
