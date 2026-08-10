import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Save, UserCog } from "lucide-react";
import { RoleSelector } from "@/components/admin/RoleSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserPayload,
} from "@/services/api/adminUserApi";
import { listRoles, type AdminRoleRecord } from "@/services/api/rolePermissionApi";

const emptyForm: AdminUserPayload = {
  name: "",
  email: "",
  password: "",
  role: "",
  is_active: true,
};

export default function AdminUserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editingId = id && id !== "nova" ? Number(id) : null;
  const [roles, setRoles] = useState<AdminRoleRecord[]>([]);
  const [form, setForm] = useState<AdminUserPayload>(emptyForm);
  const [isLoading, setIsLoading] = useState(Boolean(editingId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([listRoles(), editingId ? listAdminUsers() : Promise.resolve([])])
      .then(([roleRecords, userRecords]) => {
        if (!mounted) {
          return;
        }

        setRoles(roleRecords);

        if (!editingId && roleRecords[0]) {
          setForm((current) => ({ ...current, role: roleRecords[0].key }));
        }

        if (editingId) {
          const user = userRecords.find((record) => record.id === editingId);

          if (!user) {
            throw new Error("Usuária administrativa não encontrada.");
          }

          setForm({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            is_active: user.is_active,
          });
        }
      })
      .catch((caught: Error) => {
        if (mounted) {
          setError(caught.message);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [editingId]);

  const title = useMemo(
    () => (editingId ? "Editar usuária administrativa" : "Nova usuária administrativa"),
    [editingId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      ...form,
      password: form.password?.trim() ? form.password : undefined,
    };

    try {
      if (editingId) {
        await updateAdminUser(editingId, payload);
      } else {
        await createAdminUser(payload);
      }

      navigate("/usuarios-painel");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar a usuária administrativa.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <UserCog className="h-4 w-4" />
          Perfis e permissões
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          Defina credenciais, perfil administrativo e status de acesso ao portal.
        </p>
      </section>

      {error ? <p className="rounded border border-destructive/30 p-3 text-sm text-destructive">{error}</p> : null}

      <form className="space-y-5 rounded border bg-card p-5 shadow-sm" onSubmit={handleSubmit}>
        {isLoading ? <p>Carregando dados da usuária...</p> : null}

        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">{editingId ? "Nova senha" : "Senha"}</Label>
          <Input
            id="password"
            type="password"
            value={form.password ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required={!editingId}
          />
        </div>

        <div className="grid gap-2">
          <Label>Perfil</Label>
          <RoleSelector
            roles={roles}
            value={form.role}
            onChange={(role) => setForm((current) => ({ ...current, role }))}
          />
        </div>

        <div className="flex items-center justify-between rounded border p-3">
          <div>
            <Label htmlFor="is_active">Acesso ativo</Label>
            <p className="text-sm text-muted-foreground">Usuárias inativas não conseguem autenticar no portal.</p>
          </div>
          <Switch
            id="is_active"
            checked={form.is_active}
            onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link to="/usuarios-painel">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSaving || !form.role} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
