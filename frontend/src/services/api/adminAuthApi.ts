import { apiRequest } from "@/services/api/client";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

export type AdminLoginResponse = {
  token: string;
  user: AdminUser;
};

export function loginAdmin(email: string, password: string): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchAdminMe(token: string): Promise<{ user: AdminUser }> {
  return apiRequest<{ user: AdminUser }>("/admin/auth/me", {}, { token });
}

export function logoutAdmin(token: string): Promise<void> {
  return apiRequest<void>("/admin/auth/logout", { method: "POST" }, { token });
}
