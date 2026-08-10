import { apiRequest } from "@/services/api/client";

export type MobileSession = {
  token: string;
  access_state: "full" | "restricted" | "email_verification_required";
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export function registerMobileUser(input: {
  name: string;
  email: string;
  password: string;
  birth_date: string;
  accepted_terms: boolean;
  life_stage_id?: number;
}) {
  return apiRequest<MobileSession>("/mobile/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginMobileUser(email: string, password: string) {
  return apiRequest<MobileSession>("/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verifyMobileEmail(email: string) {
  return apiRequest<{ message: string }>("/mobile/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
