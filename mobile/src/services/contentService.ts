import { apiRequest } from "@/services/api/client";

export type PublishedContent = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body?: string;
  category?: { name: string; slug: string };
};

export function fetchPublishedContents(params: { q?: string } = {}) {
  const query = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  return apiRequest<{ data: PublishedContent[] }>(`/mobile/contents${query}`);
}

export function fetchPublishedContentDetail(slug: string) {
  return apiRequest<{ data: PublishedContent }>(`/mobile/contents/${slug}`);
}
