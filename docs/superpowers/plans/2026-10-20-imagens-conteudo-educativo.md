# Imagens em conteúdos educativos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir colar imagens no editor administrativo, armazená-las com segurança e renderizá-las nos conteúdos publicados do aplicativo móvel.

**Architecture:** Portal envia arquivo colado a endpoint administrativo autenticado; endpoint valida e devolve URL pública absoluta. Corpo continua HTML, mas sanitizador preserva `img[src,alt]` apenas para URLs do armazenamento editorial. Parser mobile transforma essas tags em blocos de imagem renderizados por `RichText`.

**Tech Stack:** Laravel 12/PHP 8.2, Sanctum, filesystem Laravel, Pest, React 18/TypeScript, TipTap 3, Vitest, Expo SDK 54/React Native 0.81, Jest.

**Spec:** `docs/superpowers/specs/2026-10-20-imagens-conteudo-educativo-design.md`

## Global Constraints

- Aceitar somente JPEG, PNG e WebP por multipart, até 5 MB.
- Gerar UUID, gravar no disco público editorial e devolver URL pública absoluta; nunca persistir Base64.
- Só autora dona de rascunho ou Admin pode enviar imagem; conteúdo arquivado nunca aceita upload.
- Sanitizador preserva somente `src` e `alt` em `img`; rejeita Base64, esquemas executáveis e origens externas.
- Preservar formatações aprovadas e links existentes.
- Imagem inicia com `alt="Imagem educativa"`, editável pela autora.
- Ler documentação exata do Expo SDK 54 antes de editar mobile, conforme `mobile/AGENTS.md`.
- Não modificar alterações já staged em `mobile/package-lock.json` e `mobile/scripts/web-dev-server.mjs`.

## Review Focus

- Arquivo com extensão válida, MIME falso: 422 sem arquivo.
- Arquivo acima de 5 MB: 422, sem HTML parcial.
- Autora em rascunho alheio: 403.
- `img` com `data:`, `javascript:` ou origem externa: removida.
- URL indisponível no mobile: fallback acessível sem remover blocos seguintes.

---

## File Structure

- `backend/app/Http/Controllers/Api/V1/Admin/ContentImageController.php`: upload autenticado.
- `backend/app/Http/Requests/Admin/StoreContentImageRequest.php`: autorização e validação.
- `backend/app/Services/Content/EditorialImageStorage.php`: UUID, disco público e URL/origem gerenciada.
- `backend/app/Services/Content/HtmlBodySanitizer.php`: allowlist de imagem.
- `backend/routes/api.php`: rota de upload.
- `backend/tests/Feature/Admin/ContentImageUploadTest.php`: contrato, autorização e validação.
- `backend/tests/Unit/Content/HtmlBodySanitizerTest.php`: imagens HTML válidas/inválidas.
- `frontend/src/services/api/contentImageApi.ts`: upload FormData.
- `frontend/src/components/content/RichTextEditor.tsx`: TipTap Image, paste, estado e alt.
- `frontend/src/pages/ContentEditorPage.tsx`: disponibilizar upload após rascunho possuir id.
- `frontend/src/tests/components/RichTextEditor.test.tsx`: paste, erro, alt, disabled.
- `mobile/src/utils/richText.ts`: bloco e parser de imagem.
- `mobile/src/components/ui/RichText.tsx`: `Image` responsiva e acessível.
- `mobile/src/utils/__tests__/richText.test.ts` e `mobile/src/components/ui/__tests__/RichText.test.tsx`: testes mobile.
- `specs/001-minha-saude-feminina/contracts/openapi.yaml`: endpoint e HTML permitido.

### Task 1: Upload administrativo e sanitização

**Files:**
- Create: `backend/app/Http/Controllers/Api/V1/Admin/ContentImageController.php`
- Create: `backend/app/Http/Requests/Admin/StoreContentImageRequest.php`
- Create: `backend/app/Services/Content/EditorialImageStorage.php`
- Modify: `backend/app/Services/Content/HtmlBodySanitizer.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/Admin/ContentImageUploadTest.php`
- Modify: `backend/tests/Unit/Content/HtmlBodySanitizerTest.php`

**Interfaces:**
- Consumes: `EducationalContentPolicy::update(User, EducationalContent)` e disco `public`.
- Produces: `POST /api/v1/admin/contents/{content}/images`, multipart `image`, resposta `201 { data: { url: string } }`.
- Produces: `EditorialImageStorage::store(UploadedFile $image): string` e `isManagedUrl(string $url): bool`.

- [ ] **Step 1: Escrever testes Pest que falham**

Cobrir JPEG/PNG/WebP válido com `Storage::fake('public')`, URL absoluta e `editorial-images/{uuid}.*`; 401 sem login; 403 para autora sem posse/não editável; 422 para MIME adulterado e 5 MB + 1 byte sem arquivo. Esperar que sanitizador mantenha imagem gerenciada com alt e remova Base64, JavaScript, origem externa e `onerror`.

- [ ] **Step 2: Executar testes para confirmar falha**

Run: `cd backend; php artisan test tests/Feature/Admin/ContentImageUploadTest.php tests/Unit/Content/HtmlBodySanitizerTest.php`

Expected: FAIL porque rota, request, serviço e allowlist não existem.

- [ ] **Step 3: Implementar interfaces**

`StoreContentImageRequest::authorize()` chama `can('update', route('content'))`; regra: `required|file|mimes:jpg,jpeg,png,webp|max:5120`. Serviço usa `Str::uuid()`, `storeAs('editorial-images', ...)` no disco público e converte `url()` em URL absoluta. Controlador retorna 201. Sanitizador permite apenas `src` e `alt`, valida `src` com `isManagedUrl`.

- [ ] **Step 4: Executar testes para confirmar sucesso**

Run: `cd backend; php artisan test tests/Feature/Admin/ContentImageUploadTest.php tests/Unit/Content/HtmlBodySanitizerTest.php`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app backend/routes/api.php backend/tests
git commit -m "feat: aceitar imagens em conteúdos educativos"
```

### Task 2: Colar e descrever imagens no portal

**Files:**
- Modify: `frontend/package.json`, `frontend/package-lock.json`
- Create: `frontend/src/services/api/contentImageApi.ts`
- Modify: `frontend/src/components/content/RichTextEditor.tsx`
- Modify: `frontend/src/pages/ContentEditorPage.tsx`
- Modify: `frontend/src/tests/components/RichTextEditor.test.tsx`

**Interfaces:**
- Consumes: endpoint Task 1.
- Produces: `uploadContentImage(contentId: number, image: File): Promise<{ url: string }>`.
- Produces: prop `contentId: number | null` em `RichTextEditor`; imagem só envia para rascunho existente.

- [ ] **Step 1: Escrever testes Vitest que falham**

Simular `ClipboardEvent` com PNG: chama serviço, insere `<img src="https://api.test/storage/editorial-images/x.png" alt="Imagem educativa">` e emite HTML. Cobrir falha com alerta sem inserir markup, edição de alt e editor disabled sem upload. Manter testes atuais de foco e link.

- [ ] **Step 2: Executar teste para confirmar falha**

Run: `cd frontend; npm test -- RichTextEditor.test.tsx`

Expected: FAIL porque extensão, serviço e fluxo de imagem não existem.

- [ ] **Step 3: Implementar extensão e interface**

Adicionar `@tiptap/extension-image` na versão `^3.30.3`. Serviço usa cliente autenticado e `FormData`, sem `Content-Type` manual. Editor intercepta somente arquivos JPEG/PNG/WebP em paste, expõe estado acessível, insere apenas URL da API e abre ação/modal para trocar alt da imagem selecionada. Criação nova deve salvar rascunho antes de habilitar upload; não há upload sem `contentId`. Preservar seleção/foco e controles existentes.

- [ ] **Step 4: Executar testes e qualidade web**

Run: `cd frontend; npm test -- RichTextEditor.test.tsx; npm run lint; npm run build`

Expected: PASS, sem erro TypeScript/lint/build.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/services/api/contentImageApi.ts frontend/src/components/content/RichTextEditor.tsx frontend/src/pages/ContentEditorPage.tsx frontend/src/tests/components/RichTextEditor.test.tsx
git commit -m "feat: colar imagens no editor de conteúdo"
```

### Task 3: Imagens no aplicativo móvel

**Files:**
- Modify: `mobile/src/utils/richText.ts`
- Create: `mobile/src/utils/__tests__/richText.test.ts`
- Modify: `mobile/src/components/ui/RichText.tsx`
- Create: `mobile/src/components/ui/__tests__/RichText.test.tsx`

**Interfaces:**
- Consumes: HTML sanitizado `<img src="absolute managed URL" alt="text">`.
- Produces: variante `RichTextBlock` `{ kind: 'image'; src: string; alt: string }`.

- [ ] **Step 1: Ler docs Expo 54 e escrever testes Jest que falham**

Ler `https://docs.expo.dev/versions/v54.0.0/` e documentação de `Image` antes de editar. Cobrir parser com imagem simples, imagem entre parágrafos/listas, alt ausente com fallback e src ausente ignorado. No componente, mockar `Image` e testar `source.uri`, `accessibilityLabel`, largura fluida e erro sem remover parágrafo seguinte.

- [ ] **Step 2: Executar teste para confirmar falha**

Run: `cd mobile; npm test -- richText.test.ts RichText.test.tsx --runInBand`

Expected: FAIL porque não há bloco de imagem.

- [ ] **Step 3: Implementar parser e renderização**

Extrair `src`/ `alt` de `img`; criar bloco somente com src não vazio. Renderizar `Image` com largura 100%, proporção por `onLoad`, `resizeMode="contain"`, `accessible`, `accessibilityLabel` e fallback compacto no `onError`. Não alterar Text, listas ou Linking.

- [ ] **Step 4: Executar testes e lint mobile**

Run: `cd mobile; npm test -- richText.test.ts RichText.test.tsx --runInBand; npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/utils/richText.ts mobile/src/utils/__tests__/richText.test.ts mobile/src/components/ui/RichText.tsx mobile/src/components/ui/__tests__/RichText.test.tsx
git commit -m "feat: exibir imagens nos conteúdos mobile"
```

### Task 4: Contrato e verificação final

**Files:**
- Modify: `specs/001-minha-saude-feminina/contracts/openapi.yaml`
- Modify: `backend/tests/Feature/Contracts/OpenApiAdminRouteCoverageTest.php`
- Modify: `backend/tests/Feature/Mobile/PublishedContentContractTest.php`

**Interfaces:**
- Consumes: rota Task 1 e markup Tasks 1–3.
- Produces: OpenAPI de upload `multipart/form-data`, URL e erros 401/403/422.

- [ ] **Step 1: Escrever testes de contrato que falham**

Exigir rota no OpenAPI e roteador. Acrescentar detalhe mobile com HTML de imagem gerenciada; confirmar lista continua sem `body`.

- [ ] **Step 2: Executar teste para confirmar falha**

Run: `cd backend; php artisan test tests/Feature/Contracts/OpenApiAdminRouteCoverageTest.php tests/Feature/Mobile/PublishedContentContractTest.php`

Expected: FAIL até contrato declarar rota.

- [ ] **Step 3: Documentar contrato**

Adicionar `/contents/{id}/images` com bearer, multipart `image`, schema `ContentImageUpload`, tipos/limite e respostas. Documentar que `ContentWrite.body` aceita HTML sanitizado com `img[src,alt]` de URL gerenciada. Não criar endpoint mobile.

- [ ] **Step 4: Executar suítes e inspeção visual**

Run: `cd backend; php artisan test`

Run: `cd frontend; npm test; npm run lint; npm run build`

Run: `cd mobile; npm test -- --runInBand; npm run lint`

Inspecionar editor web e detalhe mobile: colar PNG, trocar alt, salvar/publicar, abrir no app; confirmar proporção, link, falha de imagem e teclado na barra.

Expected: Todas suítes passam; imagem aparece em portal/mobile; conteúdo inválido nunca persiste.

- [ ] **Step 5: Detector visual e commit**

Run: `C:\\Users\\luisp\\.codex\\plugins\\cache\\openai-curated-remote\\impeccable\\4.3.1\\skills\\impeccable\\scripts\\impeccable.cmd detect --json frontend/src/components/content/RichTextEditor.tsx frontend/src/pages/ContentEditorPage.tsx`

Corrigir apenas achados desta mudança. Depois:

```bash
git add specs/001-minha-saude-feminina/contracts/openapi.yaml backend/tests/Feature/Contracts/OpenApiAdminRouteCoverageTest.php backend/tests/Feature/Mobile/PublishedContentContractTest.php
git commit -m "docs: documentar upload de imagens editoriais"
```

## Self-Review

- Cobertura: Tasks 1–4 cobrem upload, segurança, sanitização, editor, acessibilidade, mobile, OpenAPI e verificação.
- Consistência: endpoint, serviço, markup e variante de bloco usam nomes compatíveis.
- Review Focus: cada risco listado recebe teste em Tasks 1–3.
- Proporção: plano fixa interfaces e verificações, sem transcrever implementação.

