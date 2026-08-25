# Implementation Plan: Minha Saúde Feminina

**Branch**: `[001-minha-saude-feminina]` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-minha-saude-feminina/spec.md` plus planning request for the current increment focused only on the administrative web portal and backend.

## Summary

Implementar o incremento atual do Minha Saúde Feminina como um portal administrativo web em React/TypeScript consumindo uma API REST Laravel com PostgreSQL. A entrega cobre autenticação administrativa, gestão de usuários administrativos, perfis e permissões, gestão de conteúdos educativos, categorias, fases da vida, faixas etárias, fluxo editorial, auditoria, histórico de alterações, notificações administrativas por e-mail, busca tolerante a acentos e suporte UTF-8 ponta a ponta.

O app mobile, usuários comuns do futuro app, endpoints mobile, ciclo menstrual, sintomas, lembretes mobile, push mobile, perguntas para consulta e resumo visual permanecem fora deste incremento. A modelagem deve preparar conteúdos publicados para consumo futuro pelo app, mas o consumo mobile não será implementado agora.

## Technical Context

**Language/Version**: PHP 8.x com Laravel 11.x ou versão vigente do projeto; TypeScript 5.x; React web.

**Primary Dependencies**: Laravel, API REST, autenticação administrativa por sessão/token revogável, PostgreSQL, React, TypeScript, cliente HTTP tipado, Laravel Mail/Notifications ou camada equivalente, PHPUnit/Pest, Vitest e React Testing Library.

**Storage**: PostgreSQL relacional para usuários administrativos, perfis, permissões, conteúdos, categorias, fases da vida, faixas etárias, estados editoriais, auditoria, notificações administrativas e histórico de alterações.

**Testing**: PHPUnit/Pest no backend; Vitest/Testing Library no portal; testes de contrato da API REST; testes de integração para permissões, fluxo editorial, auditoria, notificações, UTF-8 e busca tolerante a acentos; validação manual pelo quickstart.

**Target Platform**: Backend Laravel/API em ambiente PHP; portal administrativo web em browser moderno.

**Project Type**: Aplicação web administrativa + backend API.

**Performance Goals**: 95% das listagens e buscas administrativas principais devem responder em até 2 segundos em ambiente de teste com massa realista; ações editoriais devem concluir sem bloquear a interface além de feedback de processamento.

**Constraints**: Sem app mobile neste incremento; sem endpoints específicos de app mobile, exceto contratos mínimos de preparação para futura exposição de conteúdos publicados se forem estritamente necessários e mantidos inativos/fora do consumo; sem IA, PDF, UBS/serviços públicos, monetização, anúncios, login social, diagnóstico ou prescrição. UTF-8 obrigatório em banco, backend, API, portal e e-mails.

**Scale/Scope**: Incremento administrativo/editorial universitário, com arquitetura simples, testável e evolutiva.

**Affected Channels**: admin web, backend API, PostgreSQL, e-mail administrativo.

**Out-of-Increment Channels**: app mobile, push mobile, endpoints de usuários finais e qualquer funcionalidade específica do app.

**Sensitive Data Impact**: dados de acesso administrativo, perfis, permissões, autoria editorial, revisão, auditoria e histórico. Não há coleta de dados pessoais de saúde de usuárias finais neste incremento.

**Access Roles**: Acadêmica/autora, Revisor/professor, Admin.

**Editorial/Audit Impact**: fluxo Rascunho -> Em revisão -> Aprovado -> Publicado -> Arquivado, com auditoria obrigatória em todas as transições e histórico de alterações de conteúdo.

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design: Passed.*

- Health safety: conteúdo é educativo; portal, backend e conteúdos não diagnosticam, não prescrevem, não sugerem automedicação e devem indicar busca por atendimento profissional quando aplicável.
- Channel scope: este incremento afeta `admin-web`, `backend-api`, `postgresql` e `email-admin`; `mobile` fica fora da implementação.
- Sensitive data and LGPD: não há dados de saúde de usuárias finais; dados administrativos e auditoria são protegidos por privilégio mínimo e logs sanitizados.
- Access control: o backend centraliza autenticação, autorização e permissões; o frontend apenas reflete permissões, sem ser fonte de enforcement.
- Editorial workflow and auditability: estados, perfis e eventos auditáveis estão definidos; toda transição editorial gera auditoria.
- Accessibility and language: portal, mensagens, e-mails e conteúdos usam Português do Brasil com acentuação preservada.
- MVP discipline: IA, PDF, UBS, monetização, app mobile e funcionalidades de usuárias finais permanecem fora do incremento.

## Project Structure

### Documentation (this feature)

```text
specs/001-minha-saude-feminina/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
backend/
|-- app/
|   |-- Models/
|   |-- Policies/
|   |-- Services/
|   |   |-- Audit/
|   |   |-- Content/
|   |   |-- Notifications/
|   |   `-- Search/
|   |-- Http/
|   |   |-- Controllers/Api/V1/Admin/
|   |   |-- Middleware/
|   |   |-- Requests/Admin/
|   |   `-- Resources/Admin/
|   `-- Mail/
|-- database/
|   |-- migrations/
|   `-- seeders/
|-- routes/
|   `-- api.php
`-- tests/
    |-- Feature/
    `-- Unit/

frontend/
|-- src/
|   |-- components/
|   |   |-- admin/
|   |   |-- content/
|   |   `-- layout/
|   |-- pages/
|   |-- routes/
|   |-- services/api/
|   |-- state/
|   `-- tests/
```

**Structure Decision**: manter somente `backend/` e `frontend/` no escopo ativo. Qualquer pasta `mobile/` existente no repositório deve ser ignorada para este incremento.

## Architecture

- **Portal Administrativo React/TypeScript**: aplicação web para browser com login, dashboard, navegação por perfil, telas de conteúdo, revisão, auditoria, usuários administrativos, notificações, busca e filtros. O portal consome exclusivamente endpoints administrativos da API Laravel.
- **Backend Laravel API REST**: fonte central de autenticação, autorização, permissões, regras editoriais, auditoria, histórico, notificações por e-mail, busca e persistência.
- **PostgreSQL**: banco relacional em UTF-8, com tabelas normalizadas para identidade administrativa, RBAC simples, conteúdo editorial, taxonomias, auditoria, notificações e versões.
- **E-mail administrativo**: envio transacional para eventos editoriais, com assunto e corpo em Português do Brasil, contendo evento e ação necessária, sem carregar conteúdo completo desnecessário.
- **Contratos REST**: documentados em [contracts/openapi.yaml](./contracts/openapi.yaml), limitados aos endpoints administrativos.

## Technical Decisions

- Usar namespace REST `/api/v1/admin` para todos os endpoints deste incremento.
- Usar autenticação administrativa revogável com token/sessão compatível com Laravel; credenciais e tokens nunca aparecem em logs.
- Usar Policies, Form Requests e middleware no Laravel para aplicar permissões no backend.
- Modelar perfis e permissões de forma relacional, mas com perfis canônicos do MVP: Acadêmica/autora, Revisor/professor e Admin.
- Modelar fases da vida e faixas etárias como taxonomias associáveis aos conteúdos, sem cadastro livre irrestrito por perfis não Admin.
- Separar texto exibido de texto normalizado para busca. Títulos, descrições e corpo preservam acentuação; slugs e URLs podem ser normalizados sem acento.
- Registrar auditoria append-only para transições editoriais, edições relevantes e alterações de usuários/permissões.
- Registrar histórico de alterações por versão/snapshot para permitir rastreio editorial sem depender apenas de logs.
- Manter e-mails minimalistas: evento, ação necessária e link para o portal autenticado.
- Não implementar app mobile nem endpoints mobile neste incremento. Preparação para consumo futuro limita-se a dados de estado `Publicado` e metadados adequados no modelo de conteúdo.

## Data Model

Ver detalhes em [data-model.md](./data-model.md). O modelo técnico inclui:

- `admin_users` ou tabela `users` com marcação administrativa, estado ativo, credenciais e vínculo com perfil.
- `admin_roles` com valores canônicos Acadêmica/autora, Revisor/professor e Admin.
- `permissions` e tabela de vínculo perfil-permissão quando o projeto exigir granularidade além dos perfis.
- `content_categories` para categorias editoriais.
- `life_stages` para fases da vida associáveis aos conteúdos.
- `age_ranges` para faixas etárias associáveis aos conteúdos.
- `educational_contents` para título, slug, corpo, resumo/descrição, categoria, estado editorial, autoria e datas de workflow.
- Tabelas pivô `content_life_stage` e `age_range_content` quando o conteúdo puder ter múltiplas fases/faixas.
- `content_revisions` para snapshots e histórico de alterações.
- `editorial_audit_events` para eventos append-only.
- `admin_notifications` para notificações no painel e controle de envio por e-mail.

## Main Endpoints

Ver contrato em [contracts/openapi.yaml](./contracts/openapi.yaml). Principais grupos:

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/auth/me`
- `GET|POST /api/v1/admin/admin-users`
- `GET|PATCH /api/v1/admin/admin-users/{id}`
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/permissions`
- `GET|POST /api/v1/admin/categories`
- `GET|PATCH /api/v1/admin/categories/{id}`
- `GET /api/v1/admin/life-stages`
- `GET /api/v1/admin/age-ranges`
- `GET|POST /api/v1/admin/contents`
- `GET|PATCH /api/v1/admin/contents/{id}`
- `POST /api/v1/admin/contents/{id}/submit-review`
- `POST /api/v1/admin/contents/{id}/request-adjustments`
- `POST /api/v1/admin/contents/{id}/approve`
- `POST /api/v1/admin/contents/{id}/publish`
- `POST /api/v1/admin/contents/{id}/archive`
- `GET /api/v1/admin/contents/{id}/audit`
- `GET /api/v1/admin/contents/{id}/revisions`
- `GET /api/v1/admin/notifications`
- `POST /api/v1/admin/notifications/{id}/read`

## Authentication Strategy

- Login administrativo por e-mail e senha.
- Usuário precisa estar ativo e possuir perfil administrativo válido.
- Sessões/tokens são revogáveis no logout e na desativação do usuário.
- Respostas de erro não revelam se e-mail existe, se perfil está ausente ou detalhes internos.
- Futuro login de usuárias comuns não existe neste incremento.

## Authorization Strategy

- **Acadêmica/autora**: cria conteúdos em Rascunho, edita próprios rascunhos e envia próprios conteúdos para revisão.
- **Revisor/professor**: acessa fila de revisão, revisa, aprova ou solicita ajustes em conteúdos Em revisão.
- **Admin**: gerencia usuários, perfis, permissões, categorias, taxonomias, todos os conteúdos, publicação e arquivamento.
- Policies do Laravel são obrigatórias para conteúdo, usuário administrativo, categoria, auditoria e notificações.
- Frontend deve ocultar ações indisponíveis, mas o bloqueio decisivo fica no backend.

## Audit Strategy

- Cada transição editorial registra ator, conteúdo, ação, estado anterior, estado novo, data/hora, comentário quando aplicável e metadados mínimos.
- Criação e edição de conteúdo registram revisão/histórico e evento de auditoria.
- Aprovação registra `approved_by` e `approved_at`; publicação registra `published_by` e `published_at`; arquivamento registra `archived_by` e `archived_at`.
- Alterações de usuários administrativos, perfis, permissões e estado ativo geram auditoria.
- Eventos são append-only. Correções devem gerar novo evento, não alterar histórico.
- Logs operacionais devem mascarar ou omitir tokens, senhas, payloads extensos e detalhes sensíveis.

## Notification Strategy

- Notificações no painel são gravadas em `admin_notifications`.
- E-mails administrativos são enviados para eventos que exigem ação: conteúdo enviado para revisão, ajustes solicitados, aprovação, publicação, arquivamento e alterações administrativas relevantes.
- O destinatário é determinado por perfil e relação com o conteúdo:
  - Revisores recebem conteúdo enviado para revisão.
  - Autora recebe ajustes solicitados.
  - Admins recebem aprovações pendentes de publicação e eventos críticos.
- E-mails usam UTF-8, assunto em Português do Brasil e corpo minimalista com link para o portal.
- Falha de e-mail registra `email_failed_at`/metadados sem desfazer o evento editorial.

## UTF-8, Accent and Search Strategy

- PostgreSQL deve ser criado/configurado com encoding UTF-8.
- Conexão Laravel, headers JSON, templates de e-mail e documento HTML do portal devem preservar UTF-8.
- Campos exibidos (`title`, `description`, `body`, nomes de categorias, fases e faixas) preservam acentos e cedilha.
- Slugs e URLs podem usar normalização sem acentos.
- Busca tolerante a acentos deve usar normalização consistente, por exemplo coluna `search_text_normalized`, extensão `unaccent` do PostgreSQL quando disponível, ou normalizador de aplicação com índices apropriados.
- Testes obrigatórios: “menstruação” encontrado por “menstruacao”, “saúde” por “saude”, “prevenção” por “prevencao”, sempre exibindo grafia correta.

## Testing Strategy

- **Backend feature tests**: autenticação, usuário inativo, gestão de usuários, permissões, categorias, fases/faixas, CRUD de conteúdo, fluxo editorial, auditoria, histórico, notificações, busca e UTF-8.
- **Backend unit tests**: transições editoriais, normalização de busca, sanitização de auditoria/logs, resolução de destinatários de notificação.
- **Frontend tests**: login, dashboard, guards de rota, listagem/filtros, editor de conteúdo, fila de revisão, ações editoriais, auditoria, usuários administrativos e notificações.
- **Contract tests**: rotas OpenAPI administrativas cobertas e ausência de endpoints mobile neste incremento.
- **Accessibility checks**: navegação por teclado, foco visível, contraste e textos compreensíveis nas telas principais.
- **Manual validation**: quickstart com ciclo completo Rascunho -> Em revisão -> Aprovado -> Publicado -> Arquivado.

## Risks

- Escopo administrativo pode crescer se permissões virarem RBAC genérico complexo; manter perfis canônicos e permissões necessárias.
- Busca tolerante a acentos pode degradar performance sem índices ou normalização adequada.
- Auditoria e histórico podem duplicar dados em excesso; snapshots devem ser suficientes, não indiscriminados.
- E-mails podem expor conteúdo demais; manter link para portal autenticado e mensagem mínima.
- Artefatos/código antigos de mobile podem confundir execução; tarefas e contratos devem bloquear endpoints mobile no incremento.
- Encoding incorreto pode corromper acentos em banco, JSON, frontend ou e-mails; validar ponta a ponta.

## MVP Limitations

- Sem app mobile.
- Sem cadastro, login, validação de e-mail ou perfil de usuárias finais.
- Sem endpoints específicos do app mobile, salvo preparação contratual mínima futura que não implemente consumo.
- Sem ciclo menstrual, sintomas, lembretes mobile, push mobile, perguntas para consulta ou resumo visual.
- Sem assistente de IA.
- Sem integração com UBS, prontuário eletrônico ou serviços públicos.
- Sem exportação PDF.
- Sem monetização, anúncios ou pagamentos.
- Sem login social.
- Sem diagnóstico automatizado, prescrição ou orientação de dosagem.

## Incremental Implementation Plan

1. **Foundation backend**: configurar PostgreSQL/UTF-8, autenticação administrativa, middleware, roles, permissions e seeds canônicos.
2. **Foundation portal**: login, estado de autenticação, cliente API, layout administrativo, guards de rota e dashboard inicial.
3. **Admin users and permissions**: CRUD de usuários administrativos, ativação/desativação, alteração de perfil, auditoria e telas correspondentes.
4. **Taxonomies**: categorias, fases da vida e faixas etárias para associação a conteúdos, com endpoints e filtros.
5. **Content drafts**: modelo de conteúdos, criação/edição de rascunhos próprios, histórico de alterações e busca básica.
6. **Editorial workflow**: envio para revisão, tela de revisão, solicitação de ajustes, aprovação, publicação e arquivamento com policies.
7. **Audit and history UI**: páginas de auditoria e histórico por conteúdo, com filtros e permissões.
8. **Notifications**: notificações no painel, e-mails administrativos UTF-8 e tratamento de falhas.
9. **Accent-tolerant search**: normalização, índices, filtros administrativos e testes de preservação de grafia.
10. **Quality gates**: testes automatizados, contrato OpenAPI, acessibilidade, quickstart, revisão de logs e verificação de ausência de endpoints mobile.

## Phase 0 Research Summary

See [research.md](./research.md).

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml), and [quickstart.md](./quickstart.md).

## Complexity Tracking

No constitution violations requiring exception. A visão de produto permanece multi-canal, mas o incremento atual restringe implementação a portal administrativo, backend API, PostgreSQL e e-mail administrativo para validar primeiro a operação editorial.
