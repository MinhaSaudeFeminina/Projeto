import type { AdminUser } from "@/services/api/adminAuthApi";

const TOKEN_KEY = "msf_admin_token";
const USER_KEY = "msf_admin_user";

export function getAdminToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  const raw = window.localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function saveAdminSession(token: string, user: AdminUser): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}

export function hasAdminRole(role: string): boolean {
  return getAdminUser()?.roles.includes(role) ?? false;
}
