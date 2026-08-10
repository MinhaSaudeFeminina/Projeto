import type { MobileSession } from "@/services/authService";

let currentSession: MobileSession | null = null;

export function saveMobileSession(session: MobileSession): void {
  currentSession = session;
}

export function getMobileSession(): MobileSession | null {
  return currentSession;
}

export function clearMobileSession(): void {
  currentSession = null;
}

export function hasFullMobileAccess(): boolean {
  return currentSession?.access_state === "full";
}
