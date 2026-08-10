import { apiRequest } from "@/services/api/client";

export type LegalDocument = {
  id: number;
  type: "terms" | "privacy_policy";
  title: string;
  content: string;
  version: string;
};

export function fetchCurrentLegalDocuments() {
  return apiRequest<{ data: LegalDocument[] }>("/mobile/legal-documents/current");
}

export function acceptLegalDocuments(token: string, legal_document_ids: number[]) {
  return apiRequest<{ message: string }>(
    "/mobile/legal-acceptances",
    {
      method: "POST",
      body: JSON.stringify({ legal_document_ids }),
    },
    token,
  );
}
