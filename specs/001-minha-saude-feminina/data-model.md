# Data Model: Minha Saúde Feminina

**Date**: 2026-06-13  
**Scope**: Portal administrativo web + backend Laravel API + PostgreSQL.

## Entities

### AdminUser

Usuário administrativo autorizado a acessar o portal.

**Fields**:

- `id`
- `name`
- `email`
- `password_hash`
- `role_id`
- `is_active`
- `last_login_at`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

**Relationships**:

- Belongs to `AdminRole`
- Has many `EducationalContent` as author
- Has many `EditorialAuditEvent` as actor
- Has many `AdminNotification` as recipient

**Validation**:

- E-mail único.
- Nome e perfil obrigatórios.
- Usuário inativo não autentica e não executa ações protegidas.
- Senha nunca é retornada pela API nem registrada em auditoria/logs.

### AdminRole

Perfil administrativo canônico do incremento.

**Fields**:

- `id`
- `key`
- `name`
- `description`
- `created_at`
- `updated_at`

**Canonical values**:

- `academic_author` / Acadêmica/autora
- `reviewer_professor` / Revisor/professor
- `admin` / Admin

**Relationships**:

- Has many `AdminUser`
- Belongs to many `Permission`

### Permission

Permissão granular usada pelo backend para aplicar policies.

**Fields**:

- `id`
- `key`
- `name`
- `description`

**Examples**:

- `content.create`
- `content.update_own_draft`
- `content.submit_review`
- `content.review`
- `content.approve`
- `content.publish`
- `content.archive`
- `admin_users.manage`
- `audit.view`
- `notifications.view`

### ContentCategory

Categoria editorial para organizar conteúdos.

**Fields**:

- `id`
- `name`
- `slug`
- `description`
- `is_active`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

**Validation**:

- Nome preserva acentuação.
- Slug pode ser normalizado sem acento.

### LifeStage

Trilha por fase da vida: agrupa conteúdos educativos em ordem para uma faixa
etária e só chega ao app depois de publicada.

**Fields**:

- `id`
- `key` (derivada do nome na criação; imutável, identifica a trilha no app)
- `name`
- `description`
- `ubs_orientation`
- `warning_signals`
- `reminder_suggestions`
- `age_range_id` (faixa etária da trilha; as mesmas faixas da tela de conteúdo)
- `status` (`draft`, `published`, `archived`; só `published` aparece no app)
- `published_by`
- `published_at`
- `sort_order`
- `is_active` (disponível para marcar conteúdos no painel)

**Rules**:

- A trilha nasce em rascunho; publicar e arquivar são exclusivos dos perfis
  Admin e Revisor/professor, e toda transição gera auditoria.
- Publicar exige faixa etária definida.
- Editar e excluir seguem com o Admin; a exclusão só vale para rascunho sem
  conteúdos vinculados.

**Canonical examples**:

- Adolescência
- Vida adulta
- Gestação
- Puerpério
- Climatério/menopausa

### AgeRange

Faixa etária associável a conteúdos educativos.

**Fields**:

- `id`
- `label`
- `min_age`
- `max_age`
- `sort_order`
- `is_active`

**Canonical examples**:

- `10-14`
- `15-19`
- `20-29`
- `30-39`
- `40-49`
- `50+`

### EducationalContent

Conteúdo educativo gerenciado no fluxo editorial.

**Fields**:

- `id`
- `title`
- `slug`
- `summary`
- `body`
- `category_id`
- `status`
- `author_id`
- `submitted_by`
- `submitted_at`
- `reviewed_by`
- `reviewed_at`
- `approved_by`
- `approved_at`
- `published_by`
- `published_at`
- `archived_by`
- `archived_at`
- `search_text_normalized`
- `created_at`
- `updated_at`

**Statuses**:

- `draft`
- `in_review`
- `approved`
- `published`
- `archived`

**Relationships**:

- Belongs to `ContentCategory`
- Belongs to `AdminUser` as author
- Belongs to many `LifeStage`
- Belongs to many `AgeRange`
- Has many `ContentRevision`
- Has many `EditorialAuditEvent`
- Has many `AdminNotification`

**Rules**:

- Conteúdo novo começa em `draft`.
- Apenas autora do rascunho ou Admin pode editar rascunho.
- Apenas conteúdo `approved` pode ser publicado.
- Apenas conteúdo `published` pode ser arquivado.
- Ajustes retornam conteúdo para `draft` com comentário editorial.
- Texto exibido preserva acentuação; `search_text_normalized` é separado.

### ContentLifeStage

Tabela pivô entre conteúdo e fase da vida.

**Fields**:

- `content_id`
- `life_stage_id`
- `sort_order` (posição do conteúdo dentro da trilha)

### AgeRangeContent

Tabela pivô entre conteúdo e faixa etária.

**Fields**:

- `content_id`
- `age_range_id`

### ContentRevision

Snapshot ou registro de mudança relevante do conteúdo.

**Fields**:

- `id`
- `content_id`
- `changed_by`
- `version`
- `title_snapshot`
- `summary_snapshot`
- `body_snapshot`
- `category_snapshot`
- `life_stages_snapshot`
- `age_ranges_snapshot`
- `status_snapshot`
- `change_summary`
- `created_at`

**Rules**:

- Criar revisão em alterações de título, resumo, corpo, categoria, fases, faixas, metadados ou estado editorial.
- Preservar texto original com acentuação correta.

### EditorialAuditEvent

Evento append-only para rastreabilidade editorial e administrativa.

**Fields**:

- `id`
- `actor_id`
- `content_id`
- `target_admin_user_id`
- `action`
- `previous_status`
- `new_status`
- `comment`
- `metadata`
- `occurred_at`

**Actions**:

- `admin_user_created`
- `admin_user_updated`
- `admin_user_deactivated`
- `role_changed`
- `category_created`
- `category_updated`
- `content_created`
- `content_updated`
- `submitted_for_review`
- `adjustments_requested`
- `approved`
- `published`
- `archived`

**Rules**:

- Não atualizar nem apagar eventos de auditoria.
- Registrar data/hora, ator e estado resultante quando aplicável.
- Não armazenar senhas, tokens ou segredos em `metadata`.

### AdminNotification

Notificação administrativa no painel e base para envio por e-mail.

**Fields**:

- `id`
- `recipient_id`
- `content_id`
- `type`
- `title`
- `message`
- `action_url`
- `read_at`
- `email_sent_at`
- `email_failed_at`
- `created_at`

**Rules**:

- Mensagem deve conter evento e ação necessária.
- E-mail não deve carregar conteúdo editorial completo.
- Notificação deve respeitar perfil e relação com o conteúdo.

### Symptom

Item não pessoal do catálogo administrativo de sintomas e queixas.

**Fields**:

- `id`
- `name`
- `type`
- `short_description`
- `description` (exposto pela API administrativa como `full_description`)
- `icon`
- `category`
- `show_in_app`
- `ask_intensity`
- `ask_notes`
- `is_alert_candidate` (exposto como `generate_ubs_alert`)
- `orientation_text`
- `severity_alert_text`
- `sort_order`
- `search_text_normalized`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

**Rules**:

- Perfis administrativos autenticados podem consultar o catálogo.
- Apenas Admin com `symptoms.manage` pode criar, alterar ou excluir itens.
- Toda mutação gera evento de auditoria append-only.
- Item associado a `SymptomRecord` não pode ser excluído; deve ser ocultado com `show_in_app = false`.
- A busca usa `search_text_normalized`, preservando a grafia UTF-8 nos campos exibidos.
- A API administrativa nunca inclui registros individuais de sintomas das usuárias.

## State Transitions

```text
Rascunho -> Em revisão -> Aprovado -> Publicado -> Arquivado
```

**Allowed transitions**:

- `draft` -> `in_review`: Acadêmica/autora dona do rascunho ou Admin.
- `in_review` -> `draft`: Revisor/professor ou Admin solicitando ajustes.
- `in_review` -> `approved`: Revisor/professor ou Admin.
- `approved` -> `published`: Admin.
- `published` -> `archived`: Admin.

All other transitions are blocked in this increment.

## PostgreSQL, UTF-8 and Search

- Database encoding must be UTF-8.
- Display fields preserve Portuguese accents and cedilha.
- Slugs can be normalized without accents.
- Search compares normalized terms, not displayed text.
- Recommended implementation: `search_text_normalized` maintained from title, summary, body, category, life stages and age ranges; optionally backed by PostgreSQL `unaccent` where available.
- Required test cases:
  - “menstruação” found by “menstruacao”
  - “saúde” found by “saude”
  - “prevenção” found by “prevencao”
