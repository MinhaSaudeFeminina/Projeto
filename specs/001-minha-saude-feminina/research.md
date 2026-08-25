# Research: Minha Saúde Feminina

**Date**: 2026-06-13  
**Scope**: Plano técnico do incremento administrativo/editorial.

## Decisions

### Decision: limitar implementação a portal administrativo, backend Laravel API e PostgreSQL

**Rationale**: O recorte atual entrega a base editorial e administrativa necessária antes do app mobile. Reduz risco, evita coleta prematura de dados de saúde de usuárias finais e permite validar conteúdo, permissões, auditoria e UTF-8.

**Alternatives considered**:

- Implementar app mobile junto ao portal: rejeitado pelo escopo do incremento.
- Criar endpoints mobile agora: rejeitado, salvo preparação mínima futura para conteúdos publicados sem consumo ativo.

### Decision: usar API REST administrativa versionada

**Rationale**: O portal React consome contratos HTTP claros, testáveis e compatíveis com Laravel. O namespace `/api/v1/admin` separa o incremento atual de futuros canais.

**Alternatives considered**:

- Misturar endpoints admin e futuros endpoints mobile em `/api/v1`: rejeitado por aumentar risco de exposição indevida.
- GraphQL: rejeitado por não ser necessário para o fluxo administrativo inicial.

### Decision: aplicar permissões no backend com perfis canônicos e policies

**Rationale**: Acadêmica/autora, Revisor/professor e Admin têm responsabilidades bem definidas. Policies e middleware no Laravel garantem enforcement central.

**Alternatives considered**:

- Controle apenas no frontend: rejeitado por não ser seguro.
- RBAC genérico avançado desde o início: rejeitado para evitar overengineering; a modelagem permite permissões granulares sem abrir administração complexa no MVP.

### Decision: modelar categorias, fases da vida e faixas etárias como taxonomias relacionais

**Rationale**: Conteúdos educativos precisam ser organizáveis e preparados para consumo futuro. Taxonomias relacionais preservam consistência, filtros e evolução.

**Alternatives considered**:

- Campos texto livres no conteúdo: rejeitado por dificultar filtros e consistência.
- Taxonomias editáveis por todos os perfis: rejeitado por risco editorial; Admin controla gestão quando houver tela de administração.

### Decision: manter fluxo editorial linear

**Rationale**: Rascunho → Em revisão → Aprovado → Publicado → Arquivado cobre o ciclo requerido e simplifica validação, auditoria e permissões.

**Alternatives considered**:

- Estado “Reprovado”: rejeitado neste incremento; materiais inadequados retornam para Rascunho por solicitação de ajustes.
- Publicação por Revisor/professor: rejeitada; Admin publica e arquiva.

### Decision: auditoria append-only e histórico de alterações por snapshot

**Rationale**: Conteúdo de saúde exige responsabilização. Eventos append-only explicam quem fez o quê e quando; snapshots permitem comparar evolução editorial.

**Alternatives considered**:

- Apenas `updated_at`/`updated_by`: rejeitado por rastreabilidade insuficiente.
- Armazenar diffs complexos: adiado; snapshots simples são mais pragmáticos para o incremento.

### Decision: notificações administrativas por painel e e-mail

**Rationale**: O fluxo editorial depende de alertas para revisão, ajustes e publicação. E-mails complementam o painel sem expor conteúdo completo.

**Alternatives considered**:

- Enviar conteúdo completo por e-mail: rejeitado por minimização e segurança.
- Push mobile: fora do escopo.

### Decision: busca tolerante a acentos com preservação da grafia

**Rationale**: Pessoas administrativas podem digitar sem acentos, mas o sistema deve preservar Português do Brasil correto em textos exibidos e e-mails.

**Alternatives considered**:

- Remover acentos dos campos principais: rejeitado por violar qualidade textual.
- Busca exata apenas: rejeitada por piorar usabilidade em Português do Brasil.

## Resolved Clarifications

- Não há app mobile neste incremento.
- Não há usuários finais comuns neste incremento.
- Não há endpoints mobile ativos neste incremento.
- Conteúdos publicados devem ser modelados de forma consumível no futuro, mas o consumo mobile não será implementado agora.
- Slugs podem ser sem acento; títulos, descrições, corpo, e-mails e interface preservam acentuação.
