import { afterEach, expect, test, vi } from "vitest";
import { apiRequest } from "@/services/api/client";

function respondWith(status: number, body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("mostra a primeira mensagem de validação do campo", async () => {
  respondWith(422, {
    message: "O campo título é obrigatório. (and 1 more error)",
    errors: { title: ["O campo título é obrigatório."], summary: ["O campo resumo é obrigatório."] },
  });

  await expect(apiRequest("/admin/contents")).rejects.toThrow("O campo título é obrigatório.");
});

test("mantém a mensagem em português enviada pela API", async () => {
  respondWith(403, { message: "Perfil administrativo sem permissão para esta ação." });

  await expect(apiRequest("/admin/contents")).rejects.toThrow("Perfil administrativo sem permissão para esta ação.");
});

test("troca mensagens técnicas ou em inglês por uma mensagem genérica", async () => {
  respondWith(404, { message: "No query results for model [App\\Models\\EducationalContent] 99999" });

  await expect(apiRequest("/admin/contents/99999")).rejects.toThrow(
    "Não foi possível concluir a solicitação. Tente novamente em instantes.",
  );
});

test("não exibe detalhes de erro interno do servidor", async () => {
  respondWith(500, { message: "SQLSTATE[23505]: Unique violation", exception: "PDOException" });

  await expect(apiRequest("/admin/contents")).rejects.toThrow(
    "Ocorreu um erro inesperado no servidor. Tente novamente em instantes.",
  );
});

test("usa a mensagem genérica quando a resposta não é JSON", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 400 })));

  await expect(apiRequest("/admin/contents")).rejects.toThrow(
    "Não foi possível concluir a solicitação. Tente novamente em instantes.",
  );
});
