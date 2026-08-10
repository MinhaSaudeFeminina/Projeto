import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShieldCheck, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAdminUsers, type ManagedAdminUser } from "@/services/api/adminUserApi";
import { listRoles, type AdminRoleRecord } from "@/services/api/rolePermissionApi";

export default function AdminUserListPage() {
  const [users, setUsers] = useState<ManagedAdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([listAdminUsers(), listRoles()])
      .then(([userRecords, roleRecords]) => {
        if (!mounted) {
          return;
        }

        setUsers(userRecords);
        setRoles(roleRecords);
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
  }, []);

  const roleNames = useMemo(() => new Map(roles.map((role) => [role.key, role.name])), [roles]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Controle de acesso
          </div>
          <h1 className="text-2xl font-bold">Usuárias administrativas</h1>
          <p className="max-w-3xl text-muted-foreground">
            Gerencie acesso, perfis administrativos e status de uso do portal.
          </p>
        </div>
        <Button asChild>
          <Link to="/usuarios-painel/nova" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova usuária
          </Link>
        </Button>
      </section>

      {error ? <p className="rounded border border-destructive/30 p-3 text-sm text-destructive">{error}</p> : null}

      <section className="rounded border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Carregando usuárias administrativas...</TableCell>
              </TableRow>
            ) : null}

            {!isLoading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>Nenhuma usuária administrativa cadastrada.</TableCell>
              </TableRow>
            ) : null}

            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    {user.name}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{roleNames.get(user.role) ?? user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/usuarios-painel/${user.id}`}>Editar</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
