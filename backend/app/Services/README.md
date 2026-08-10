# Serviços de Domínio do Backend

Este diretório concentra regras de aplicação do backend Laravel para o incremento administrativo/editorial do Minha Saúde Feminina. O escopo ativo é somente portal administrativo, API Laravel, PostgreSQL, e-mail administrativo, auditoria, conteúdos educativos e busca.

## Módulos Ativos

- `Audit/`: sanitização e gravação append-only de eventos administrativos e editoriais.
- `Content/`: regras de conteúdos educativos, revisão, versionamento, slug, preparação de texto e fluxo editorial.
- `Notifications/`: resolução de destinatários, criação de notificações de painel e envio de e-mails administrativos.
- `Search/`: normalização para busca tolerante a acentos, sem alterar a grafia exibida.

Pastas legadas ou de fases futuras, como `Health/`, `Legal/` e `Profile/`, não devem receber novas regras neste incremento, salvo refatoração explícita para remover dependências antigas. Não implementar serviços para app mobile, usuárias finais, ciclo menstrual, sintomas, lembretes, perguntas para consulta, resumo visual, assistente de IA, UBS, PDF ou monetização.

## Convenções Gerais

- Serviços devem encapsular regras de negócio reutilizadas por controllers, jobs, mailers ou policies.
- Controllers devem coordenar requests/responses; serviços devem executar decisões de domínio.
- Policies continuam responsáveis por autorização decisiva; serviços podem receber usuários já autorizados, mas não devem substituir policies.
- Métodos que mudam estado editorial devem operar em transação quando atualizam conteúdo, revisão, auditoria ou notificação em conjunto.
- Logs e exceções não devem expor senhas, tokens, payloads completos, corpo integral de conteúdo quando desnecessário ou detalhes internos sensíveis.
- Textos persistidos e enviados por e-mail devem preservar UTF-8, acentuação, cedilha e caracteres especiais em Português do Brasil.

## Auditoria

- Eventos editoriais e administrativos devem ser append-only.
- Toda transição de conteúdo deve registrar ator, ação, estado anterior, novo estado, data/hora e comentário quando aplicável.
- Aprovação, publicação e arquivamento também devem preencher metadados próprios no conteúdo, como `approved_at`, `published_at` e `archived_at`.
- O sanitizador de auditoria deve remover ou mascarar tokens, senhas, segredos e payloads excessivos antes de persistir metadata.

## Conteúdo e Fluxo Editorial

- O fluxo editorial permitido é `draft` -> `in_review` -> `approved` -> `published` -> `archived`.
- Solicitação de ajustes retorna conteúdo de `in_review` para `draft` com comentário editorial obrigatório.
- Conteúdos novos começam como `draft`.
- Autoras editam apenas rascunhos próprios; Admin pode gerenciar todos conforme policy.
- Revisões devem preservar snapshots suficientes de título, resumo, corpo, categoria, fases da vida, faixas etárias e status.
- Slugs podem ser normalizados sem acento, mas título, resumo e corpo nunca devem perder acentuação.

## Notificações Administrativas

- Notificações de painel devem ser criadas para eventos que exigem atenção administrativa.
- E-mails administrativos devem ser minimalistas: evento, ação necessária e link para o portal autenticado.
- O corpo do e-mail deve estar em Português do Brasil com acentuação correta.
- Falha no envio de e-mail não deve desfazer a ação editorial; deve ser registrada em metadados próprios.

## Busca Tolerante a Acentos

- A busca deve comparar termos normalizados, como `menstruacao`, com textos originais contendo acentos, como `menstruação`.
- Campos exibidos devem continuar com a grafia editorial correta.
- A normalização pode usar coluna preparada, extensão PostgreSQL `unaccent` quando disponível ou normalizador de aplicação.
- Índices e consultas devem considerar filtros administrativos por status, categoria, fase da vida, faixa etária e autoria.
