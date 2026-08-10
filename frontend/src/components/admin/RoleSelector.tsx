import type { AdminRoleRecord } from "@/services/api/rolePermissionApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RoleSelectorProps = {
  roles: AdminRoleRecord[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function RoleSelector({ roles, value, onChange, disabled = false }: RoleSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label="Perfil administrativo">
        <SelectValue placeholder="Selecione um perfil" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.key} value={role.key}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
