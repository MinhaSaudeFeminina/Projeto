# Feature Specification: Minha Saúde Feminina

**Feature Branch**: `[001-minha-saude-feminina]`

**Created**: 2026-06-10

**Updated**: 2026-08-25

**Status**: Draft

**Input**: Alterar o escopo do incremento/MVP atual para planejar e implementar somente o portal administrativo web, o backend Laravel API e o banco PostgreSQL, com foco em autenticação administrativa, permissões, gestão editorial de conteúdos educativos, auditoria, notificações administrativas, Português do Brasil, busca tolerante a acentos e suporte UTF-8.

## Overview

Minha Saúde Feminina continua sendo concebido como um ecossistema com aplicativo mobile para usuárias finais, portal administrativo web e backend centralizado. Porém, este incremento atual entrega apenas a base administrativa e editorial: portal administrativo web, backend Laravel API e banco PostgreSQL.

O objetivo deste incremento é permitir que usuárias administrativas criem, revisem, aprovem, publiquem e arquivem conteúdos educativos sobre saúde feminina com controle de acesso, rastreabilidade e qualidade textual. O sistema deve operar em Português do Brasil, preservar acentos, cedilha e caracteres especiais, e permitir busca administrativa tolerante a acentos.

O aplicativo mobile, cadastro e login de usuárias finais, registros pessoais de saúde, lembretes mobile, push notifications mobile, perguntas para consulta, resumo visual e funcionalidades específicas do app permanecem fora deste incremento e planejados para fase futura. O catálogo administrativo de sintomas e queixas é uma exceção explícita: pode ser gerenciado no portal sem expor registros individuais de saúde.

O produto mantém caráter educativo e de apoio ao autocuidado. Nenhuma parte do portal, backend ou conteúdo publicado deve diagnosticar doenças, prescrever medicamentos, orientar automedicação, substituir atendimento profissional ou induzir atraso na busca por cuidado.

## Clarifications

### Session 2026-06-10

- Q: Qual deve ser a profundidade realista do MVP para os módulos descritos? → A: A resposta original incluía todos os módulos com profundidade mínima testável, mas foi substituída pelo novo recorte de 2026-06-13.
- Q: Quem pode publicar e arquivar conteúdos no MVP? → A: Revisor/professor pode aprovar ou solicitar ajustes; Admin publica e arquiva.
- Q: Que informações podem aparecer em notificações e e-mails administrativos? → A: E-mail administrativo informa apenas evento e ação necessária, direcionando ao portal para detalhes.

### Session 2026-06-13

- O incremento atual inclui somente portal administrativo web, backend Laravel API e banco PostgreSQL.
- O app mobile e todas as funcionalidades específicas de usuárias finais foram removidos do escopo deste incremento e permanecem planejados para fase futura.
- O assistente de IA, integração com UBS ou serviços públicos, exportação PDF e monetização continuam fora do MVP.
- Apenas autenticação administrativa, usuários administrativos, permissões administrativas, fluxo editorial, auditoria, notificações administrativas, UTF-8 e busca administrativa tolerante a acentos serão planejados e implementados agora.

### Session 2026-08-25

- O backend administrativo passa a incluir o catálogo de sintomas e queixas consumido pela tela web.
- Perfis administrativos autenticados podem consultar o catálogo; somente Admin pode criar, alterar, desativar ou excluir itens.
- Registros individuais de sintomas das usuárias continuam fora do portal administrativo e não podem ser expostos por esses endpoints.

## Technical Decisions for Planning

- O portal administrativo web será desenvolvido com React e TypeScript.
- O backend será uma API em Laravel.
- O banco de dados será PostgreSQL.
- O backend Laravel centraliza autenticação administrativa, autorização, permissões, regras editoriais, auditoria, notificações administrativas, envio de e-mail e exposição dos contratos consumidos pelo portal.
- O sistema deve usar codificação compatível com UTF-8 no backend, banco de dados, API, portal web e e-mails, preservando acentos, cedilha e caracteres especiais.
- O app mobile é parte da visão de produto, mas não será planejado nem implementado neste incremento.

## Objectives

- Entregar um portal administrativo funcional para operação editorial de conteúdos educativos.
- Permitir autenticação segura de usuárias administrativas.
- Controlar permissões administrativas por perfil.
- Gerenciar usuárias administrativas e seus estados de acesso.
- Permitir cadastro, edição, revisão, aprovação, publicação e arquivamento de conteúdos educativos.
- Garantir o fluxo editorial Rascunho → Em revisão → Aprovado → Publicado → Arquivado.
- Registrar auditoria editorial completa com responsáveis, eventos, datas, horários e histórico de alterações.
- Enviar notificações administrativas no painel e por e-mail para eventos editoriais relevantes.
- Garantir conteúdos e interfaces em Português do Brasil, com acentuação correta.
- Garantir busca administrativa tolerante a acentos sem alterar a grafia exibida.
- Permitir que Admin gerencie um catálogo auditável de sintomas e queixas, com busca, filtros e textos seguros em saúde.
- Manter fora do incremento tudo que depende do app mobile ou de usuárias finais.

## Personas and User Types

- **Acadêmica/autora**: Usuária administrativa que cria conteúdos em Rascunho, edita os próprios rascunhos e envia materiais para revisão.
- **Revisor/professor**: Usuário administrativo que revisa conteúdos enviados, solicita ajustes ou aprova materiais antes da publicação.
- **Admin**: Usuário administrativo com permissão para gerenciar usuárias administrativas, perfis, conteúdos, publicação, arquivamento e auditoria.
- **Equipe de governança do produto**: Grupo responsável por zelar por segurança em saúde, qualidade editorial, LGPD, acessibilidade, escopo do incremento e conformidade do fluxo.
- **Usuária final do aplicativo**: Pessoa prevista na visão futura do ecossistema, sem acesso e sem funcionalidades neste incremento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acessar o portal administrativo (Priority: P1)

Como usuária administrativa, quero acessar o portal com credenciais próprias para executar apenas as ações permitidas ao meu perfil.

**Why this priority**: Autenticação administrativa e separação de permissões são pré-requisitos para qualquer operação editorial segura.

**Independent Test**: Pode ser testado criando usuárias administrativas com perfis diferentes, autenticando no portal e verificando quais telas e ações ficam disponíveis para cada perfil.

**Acceptance Scenarios**:

1. **Given** uma usuária administrativa ativa, **When** ela informa e-mail e senha válidos, **Then** o sistema autentica a sessão administrativa e exibe o painel conforme seu perfil.
2. **Given** uma pessoa sem acesso administrativo ativo, **When** ela tenta autenticar no portal, **Then** o sistema bloqueia o acesso com mensagem clara.
3. **Given** uma Acadêmica/autora autenticada, **When** ela tenta aprovar, publicar ou arquivar conteúdo, **Then** o sistema bloqueia a ação.
4. **Given** uma usuária administrativa desativada, **When** ela tenta acessar o portal ou usar uma sessão existente, **Then** o sistema impede o acesso.

---

### User Story 2 - Gerenciar usuárias administrativas e permissões (Priority: P1)

Como Admin, quero cadastrar, editar, desativar e atribuir perfis administrativos para controlar quem pode criar, revisar, aprovar, publicar, arquivar e administrar conteúdos.

**Why this priority**: O portal depende de usuários e permissões corretamente configurados para manter privilégio mínimo e responsabilização.

**Independent Test**: Pode ser testado cadastrando usuárias administrativas, alterando perfis, desativando acessos e validando bloqueios por perfil.

**Acceptance Scenarios**:

1. **Given** uma pessoa com perfil Admin, **When** ela cadastra uma nova usuária administrativa com perfil Acadêmica/autora, Revisor/professor ou Admin, **Then** essa pessoa pode acessar somente as ações permitidas ao perfil atribuído.
2. **Given** uma usuária administrativa existente, **When** Admin altera seu perfil, **Then** as permissões são atualizadas na próxima ação ou sessão.
3. **Given** uma usuária administrativa desativada, **When** ela tenta autenticar ou executar ações, **Then** o sistema bloqueia o acesso.
4. **Given** qualquer alteração de perfil ou estado de acesso, **When** a alteração é salva, **Then** o sistema registra quem alterou, quando alterou e o que foi alterado.

---

### User Story 3 - Criar e editar conteúdos educativos (Priority: P1)

Como Acadêmica/autora, quero criar conteúdos educativos em rascunho e editar meus próprios rascunhos para preparar materiais antes da revisão.

**Why this priority**: A criação controlada de rascunhos inicia o fluxo editorial e preserva autoria.

**Independent Test**: Pode ser testado criando um conteúdo como autora, editando o próprio rascunho, tentando editar rascunho de outra autora e verificando histórico de alterações.

**Acceptance Scenarios**:

1. **Given** uma Acadêmica/autora autenticada, **When** ela cria um conteúdo com título, corpo, categoria e metadados obrigatórios, **Then** o conteúdo é salvo como Rascunho e registra autoria.
2. **Given** um rascunho próprio, **When** a autora edita título, corpo ou metadados, **Then** o sistema salva a alteração e registra histórico.
3. **Given** um rascunho de outra autora, **When** uma Acadêmica/autora tenta editá-lo, **Then** o sistema bloqueia a ação.
4. **Given** conteúdo em Português do Brasil, **When** ele é exibido no portal, **Then** acentos, cedilha e caracteres especiais são preservados.

---

### User Story 4 - Revisar, aprovar ou solicitar ajustes (Priority: P1)

Como Revisor/professor, quero revisar conteúdos enviados, aprovar materiais adequados ou solicitar ajustes para garantir qualidade antes da publicação.

**Why this priority**: Conteúdos de saúde exigem revisão qualificada antes de publicação.

**Independent Test**: Pode ser testado enviando conteúdo para revisão, solicitando ajustes, aprovando conteúdo e verificando permissões e auditoria.

**Acceptance Scenarios**:

1. **Given** um conteúdo em Rascunho, **When** a autora envia para revisão, **Then** o conteúdo muda para Em revisão e registra quem enviou e quando.
2. **Given** um conteúdo Em revisão, **When** Revisor/professor solicita ajustes com comentário editorial, **Then** o conteúdo retorna para Rascunho e registra a solicitação.
3. **Given** um conteúdo Em revisão, **When** Revisor/professor aprova o conteúdo, **Then** o conteúdo muda para Aprovado e registra responsável e data de aprovação.
4. **Given** conteúdo em estado diferente de Em revisão, **When** Revisor/professor tenta aprovar, **Then** o sistema bloqueia a transição inválida.

---

### User Story 5 - Publicar e arquivar conteúdos (Priority: P1)

Como Admin, quero publicar conteúdos aprovados e arquivar conteúdos publicados para controlar o que está disponível para uso futuro pelo ecossistema.

**Why this priority**: A publicação precisa ser uma decisão administrativa auditável, separada da aprovação editorial.

**Independent Test**: Pode ser testado aprovando um conteúdo, publicando como Admin, arquivando conteúdo publicado e verificando histórico e estados.

**Acceptance Scenarios**:

1. **Given** um conteúdo Aprovado, **When** Admin publica o conteúdo, **Then** o estado muda para Publicado e registra quem publicou e quando.
2. **Given** um conteúdo sem aprovação registrada, **When** Admin tenta publicar, **Then** o sistema bloqueia a publicação.
3. **Given** um conteúdo Publicado, **When** Admin arquiva, **Then** o estado muda para Arquivado e registra o arquivamento.
4. **Given** um conteúdo Arquivado, **When** ele é consultado no portal, **Then** permanece visível para auditoria administrativa e histórico, sem voltar automaticamente ao fluxo ativo.

---

### User Story 6 - Consultar auditoria editorial e histórico (Priority: P1)

Como Admin, Revisor/professor ou autora autorizada, quero visualizar eventos e histórico editorial conforme minhas permissões para entender a evolução de um conteúdo.

**Why this priority**: Rastreabilidade é requisito central para conteúdos educativos de saúde.

**Independent Test**: Pode ser testado executando o ciclo completo de um conteúdo e verificando eventos de criação, edição, envio, revisão, aprovação, publicação, arquivamento e alterações.

**Acceptance Scenarios**:

1. **Given** um conteúdo com alterações, **When** pessoa autorizada abre o histórico, **Then** o sistema exibe versões ou registros suficientes para rastrear mudanças.
2. **Given** eventos editoriais relevantes, **When** a auditoria é consultada, **Then** cada evento mostra responsável, ação, data, hora, estado anterior e estado resultante quando aplicável.
3. **Given** um conteúdo aprovado, **When** a auditoria é consultada, **Then** o sistema exibe data de aprovação e quem aprovou.
4. **Given** uma pessoa sem permissão sobre determinado conteúdo, **When** ela tenta consultar auditoria, **Then** o sistema bloqueia a visualização.

---

### User Story 7 - Receber notificações administrativas (Priority: P2)

Como usuária administrativa, quero receber notificações no painel e por e-mail sobre eventos editoriais que exigem minha atenção.

**Why this priority**: O fluxo editorial depende de visibilidade sobre pendências e mudanças de estado.

**Independent Test**: Pode ser testado gerando eventos editoriais e verificando notificações no painel e e-mails com texto em Português do Brasil e sem conteúdo completo desnecessário.

**Acceptance Scenarios**:

1. **Given** um conteúdo enviado para revisão, **When** o evento é registrado, **Then** revisores autorizados recebem notificação no painel.
2. **Given** um conteúdo com ajustes solicitados, **When** a solicitação é registrada, **Then** a autora responsável recebe notificação no painel e, quando configurado, por e-mail.
3. **Given** um conteúdo aprovado, publicado ou arquivado, **When** o evento ocorre, **Then** pessoas autorizadas recebem notificação administrativa conforme regras do produto.
4. **Given** uma notificação por e-mail, **When** ela é enviada, **Then** o texto informa evento e ação necessária, direcionando ao portal para detalhes.

---

### User Story 8 - Buscar conteúdos no portal (Priority: P2)

Como usuária administrativa, quero buscar conteúdos no portal mesmo digitando termos sem acento para encontrar materiais com rapidez.

**Why this priority**: A busca administrativa precisa funcionar bem para Português do Brasil sem corromper a grafia correta dos conteúdos.

**Independent Test**: Pode ser testado cadastrando conteúdo com “menstruação”, buscando por “menstruacao” e verificando retorno com acentuação preservada.

**Acceptance Scenarios**:

1. **Given** um conteúdo com título ou corpo contendo “menstruação”, **When** pessoa administrativa busca por “menstruacao”, **Then** o conteúdo correspondente é encontrado.
2. **Given** resultados de busca, **When** eles são exibidos, **Then** a grafia original com acentuação correta é preservada.
3. **Given** busca por termo inexistente, **When** não há resultados, **Then** o portal exibe mensagem clara em Português do Brasil.

---

### User Story 9 - Gerenciar catálogo de sintomas e queixas (Priority: P2)

Como Admin, quero cadastrar e manter o catálogo de sintomas e queixas para controlar os itens disponibilizados pelos canais do produto sem acessar registros individuais das usuárias.

**Independent Test**: Pode ser testado criando, buscando, filtrando, alterando, desativando e excluindo um item sem uso; verificando o bloqueio de exclusão de item associado a registros e a auditoria das mutações.

**Acceptance Scenarios**:

1. **Given** uma pessoa administrativa autenticada, **When** consulta o catálogo, **Then** recebe os itens ordenados e pode buscar sem acentos.
2. **Given** uma pessoa com perfil Admin, **When** cria ou altera um item válido, **Then** os dados são persistidos em UTF-8 e a ação é auditada.
3. **Given** uma pessoa sem perfil Admin, **When** tenta alterar o catálogo, **Then** o backend bloqueia a ação.
4. **Given** um item associado a registros, **When** Admin tenta excluí-lo, **Then** o backend preserva o item e orienta desativar sua exibição.
5. **Given** qualquer consulta administrativa ao catálogo, **When** a resposta é retornada, **Then** nenhum registro individual de saúde é incluído.

### Edge Cases

- Tentativa de login com usuário administrativo inexistente, senha incorreta, acesso desativado ou perfil ausente deve ser recusada sem vazar informações indevidas.
- Usuária administrativa desativada durante uma sessão ativa deve perder acesso a novas ações protegidas.
- Acadêmica/autora não deve editar conteúdo de outra autora, aprovar, publicar ou arquivar.
- Revisor/professor não deve publicar, arquivar ou gerenciar usuárias administrativas no MVP.
- Admin não deve publicar conteúdo sem aprovação registrada.
- Transições fora do fluxo Rascunho → Em revisão → Aprovado → Publicado → Arquivado devem ser bloqueadas.
- Solicitação de ajustes deve registrar comentário editorial e retornar o conteúdo para Rascunho sem criar estados paralelos fora do fluxo oficial.
- Conteúdo Arquivado deve permanecer auditável e não deve ser apagado automaticamente.
- Edição de conteúdo já Aprovado, Publicado ou Arquivado deve seguir regra explícita de permissão e gerar novo histórico; por padrão, alterações editoriais substanciais exigem retorno a Rascunho ou novo ciclo de revisão.
- Busca sem acento deve encontrar texto acentuado, mas resultados devem preservar a grafia correta.
- Conteúdos com caracteres como “ç”, “á”, “é”, “í”, “ó”, “ú”, “ã”, “õ” e aspas tipográficas devem persistir e ser exibidos corretamente.
- Falha de envio de e-mail administrativo deve ser registrada sem expor conteúdo completo e sem impedir o registro do evento editorial.
- Logs e mensagens de erro não devem incluir senhas, tokens, conteúdo sensível desnecessário ou dados internos de segurança.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir autenticação de usuárias administrativas com credenciais próprias.
- **FR-002**: O sistema MUST bloquear acesso ao portal para usuárias administrativas inexistentes, inativas ou sem perfil válido.
- **FR-003**: O sistema MUST permitir logout e revogação de sessão administrativa.
- **FR-004**: O sistema MUST permitir que Admin cadastre usuárias administrativas.
- **FR-005**: O sistema MUST permitir que Admin edite dados administrativos necessários para operação do portal.
- **FR-006**: O sistema MUST permitir que Admin atribua um perfil administrativo conforme regra definida pelo produto.
- **FR-007**: O sistema MUST permitir que Admin desative e reative acessos administrativos.
- **FR-008**: O sistema MUST aplicar permissões administrativas por perfil em todas as telas e ações protegidas.
- **FR-009**: O sistema MUST oferecer os perfis Acadêmica/autora, Revisor/professor e Admin.
- **FR-010**: Acadêmica/autora MUST poder criar conteúdos em Rascunho.
- **FR-011**: Acadêmica/autora MUST poder editar os próprios rascunhos.
- **FR-012**: Acadêmica/autora MUST poder enviar os próprios rascunhos para revisão.
- **FR-013**: Revisor/professor MUST poder visualizar fila de conteúdos Em revisão permitidos ao seu perfil.
- **FR-014**: Revisor/professor MUST poder aprovar conteúdos Em revisão.
- **FR-015**: Revisor/professor MUST poder solicitar ajustes em conteúdos Em revisão com comentário editorial obrigatório.
- **FR-016**: Solicitações de ajuste MUST retornar o conteúdo para Rascunho com comentário editorial obrigatório.
- **FR-017**: Admin MUST poder visualizar e gerenciar todos os conteúdos educativos.
- **FR-018**: Admin MUST poder publicar conteúdos Aprovados.
- **FR-019**: Admin MUST poder arquivar conteúdos Publicados.
- **FR-020**: O sistema MUST implementar o fluxo editorial Rascunho → Em revisão → Aprovado → Publicado → Arquivado.
- **FR-021**: O sistema MUST bloquear transições editoriais inválidas.
- **FR-022**: Conteúdos educativos MUST possuir, no mínimo, título, corpo, categoria ou classificação editorial, estado, autoria e datas relevantes.
- **FR-023**: Conteúdos educativos MUST preservar Português do Brasil com acentuação correta, cedilha e caracteres especiais.
- **FR-024**: Conteúdos educativos MUST passar por revisão ortográfica antes da publicação.
- **FR-025**: Conteúdos educativos MUST indicar, quando aplicável, limites do produto e quando procurar atendimento profissional.
- **FR-026**: O sistema MUST registrar quem criou cada conteúdo.
- **FR-027**: O sistema MUST registrar quem editou cada conteúdo.
- **FR-028**: O sistema MUST registrar quem enviou conteúdo para revisão.
- **FR-029**: O sistema MUST registrar quem revisou conteúdo.
- **FR-030**: O sistema MUST registrar quem aprovou conteúdo.
- **FR-031**: O sistema MUST registrar quem publicou conteúdo.
- **FR-032**: O sistema MUST registrar quem arquivou conteúdo.
- **FR-033**: Eventos de auditoria MUST registrar data e hora.
- **FR-034**: Conteúdos aprovados MUST registrar data de aprovação.
- **FR-035**: Conteúdos educativos MUST manter histórico de alterações.
- **FR-036**: A auditoria MUST permitir rastrear a evolução editorial de cada conteúdo.
- **FR-037**: O portal administrativo MUST exibir notificações no painel para eventos editoriais relevantes.
- **FR-038**: O sistema MUST enviar notificações administrativas por e-mail para eventos editoriais definidos pelo produto.
- **FR-039**: E-mails administrativos MUST conter evento, ação necessária e link ou orientação para acessar o portal, sem carregar conteúdo completo desnecessário.
- **FR-040**: O portal administrativo MUST permitir busca de conteúdos por título, corpo, categoria, estado, autoria ou metadados relevantes.
- **FR-041**: A busca administrativa MUST ser tolerante a acentos.
- **FR-042**: Resultados de busca MUST preservar a grafia original com acentuação correta.
- **FR-043**: Backend, banco, API, portal web e e-mails MUST preservar UTF-8.
- **FR-044**: Todo texto visível no portal, mensagens de erro, notificações, e-mails e conteúdos educativos MUST estar em Português do Brasil.
- **FR-045**: O sistema MUST manter o assistente de IA fora do MVP.
- **FR-046**: O sistema MUST NOT incluir integração com UBS, prontuário eletrônico ou serviços públicos neste incremento.
- **FR-047**: O sistema MUST NOT incluir exportação PDF neste incremento.
- **FR-048**: O sistema MUST NOT incluir monetização, anúncios ou pagamentos neste incremento.
- **FR-049**: O sistema MUST NOT incluir cadastro, login, perfil ou funcionalidades de usuárias finais neste incremento.
- **FR-050**: O sistema MUST NOT incluir funcionalidades específicas do app mobile neste incremento.
- **FR-051**: O sistema MUST permitir que perfis administrativos autenticados consultem o catálogo de sintomas e queixas.
- **FR-052**: Somente Admin MUST poder criar, editar, desativar ou excluir itens do catálogo de sintomas e queixas.
- **FR-053**: Criação, edição e exclusão de itens do catálogo MUST gerar auditoria com ator, data, ação e identificador do item.
- **FR-054**: A busca do catálogo MUST ser tolerante a acentos e preservar a grafia original na resposta.
- **FR-055**: Itens associados a registros MUST NOT ser excluídos; o sistema MUST permitir desativar sua exibição.
- **FR-056**: Endpoints administrativos do catálogo MUST NOT retornar registros individuais de sintomas ou outros dados pessoais de saúde.

### Non-Functional Requirements

- **NFR-001**: O portal administrativo MUST priorizar eficiência operacional, clareza visual e fluxo direto para criação, revisão, aprovação, publicação e arquivamento.
- **NFR-002**: O portal MUST ser acessível para uso em browser moderno, com navegação por teclado, foco visível, contraste adequado e textos compreensíveis.
- **NFR-003**: O sistema MUST proteger credenciais, sessões e permissões administrativas contra acesso indevido.
- **NFR-004**: Logs, mensagens de erro, notificações e e-mails MUST evitar dados internos de segurança e conteúdo completo desnecessário.
- **NFR-005**: O sistema MUST preservar corretamente caracteres do Português do Brasil em telas, buscas, e-mails, notificações e conteúdos.
- **NFR-006**: O sistema MUST apresentar mensagens de erro compreensíveis, objetivas e sem julgamento.
- **NFR-007**: Fluxos administrativos centrais MUST ser testáveis de forma independente por perfil.
- **NFR-008**: Buscas e listagens administrativas principais SHOULD responder em até 2 segundos em condições normais de teste.
- **NFR-009**: O produto MUST operar sem anúncios, pagamentos, monetização, login social, IA, PDF e integrações públicas neste incremento.
- **NFR-010**: O backend, banco de dados, API, portal web e e-mails MUST usar codificação compatível com UTF-8.

### Business Rules

- **BR-001**: Usuárias finais não acessam este incremento; apenas usuárias administrativas acessam o portal.
- **BR-002**: Acadêmica/autora cria rascunhos, edita os próprios rascunhos e envia para revisão.
- **BR-003**: Revisor/professor revisa, aprova ou solicita ajustes; não publica nem arquiva no MVP.
- **BR-004**: Admin gerencia usuárias administrativas, permissões, todos os conteúdos, publicação e arquivamento.
- **BR-005**: Publicação exige aprovação prévia registrada.
- **BR-006**: Arquivamento preserva auditoria e histórico.
- **BR-007**: Solicitação de ajustes retorna o conteúdo para Rascunho e exige comentário editorial.
- **BR-008**: Conteúdos publicados mantêm autoria, revisão, aprovação, data de aprovação, publicação e histórico editorial.
- **BR-009**: Notificações administrativas devem respeitar perfil e necessidade de ação.
- **BR-010**: E-mails administrativos não devem incluir conteúdo editorial completo quando o portal puder exibir os detalhes de forma autenticada.
- **BR-011**: Conteúdos, interface, notificações e e-mails devem manter Português do Brasil com acentuação correta, exceto slugs, URLs e identificadores internos inevitáveis.
- **BR-012**: O incremento não implementa app mobile, usuárias finais ou dados pessoais de saúde registrados por usuárias finais.

### Health Safety & Trust Constraints *(mandatory for this project)*

- O produto é exclusivamente educativo e de apoio ao autocuidado.
- O portal e os conteúdos MUST NOT diagnosticar doenças, prescrever medicamentos, recomendar dosagem, orientar automedicação ou substituir atendimento profissional.
- Conteúdos educativos MUST indicar quando procurar atendimento profissional quando o tema envolver sinais de alerta ou risco.
- Conteúdos educativos devem evitar linguagem alarmista, discriminatória, moralizante ou que gere culpa.
- Conteúdos de saúde devem ser publicados somente após revisão e aprovação por perfil autorizado.
- Não haverá integração com UBS, serviços públicos, prontuários ou encaminhamento automatizado neste incremento.

### Privacy, LGPD & Access Constraints *(mandatory for this project)*

- Este incremento deve coletar apenas dados necessários para usuárias administrativas e operação editorial.
- O sistema não deve coletar, cadastrar ou processar dados de saúde de usuárias finais neste incremento.
- Acesso administrativo MUST seguir privilégio mínimo por perfil.
- Autenticação, autorização e permissões MUST ser centralizadas no backend.
- Eventos de autenticação, alteração de permissões e ações editoriais relevantes MUST ser auditáveis.
- E-mails administrativos MUST incluir apenas evento e ação necessária, direcionando pessoas autorizadas ao portal para detalhes.
- Logs e mensagens de erro MUST omitir, mascarar ou generalizar dados sensíveis, tokens, senhas e detalhes internos de segurança.

### Editorial & Audit Constraints *(mandatory when content or admin actions are involved)*

- Estados editoriais obrigatórios: Rascunho → Em revisão → Aprovado → Publicado → Arquivado.
- Acadêmica/autora pode criar conteúdos em Rascunho, editar os próprios rascunhos e enviar para revisão.
- Revisor/professor pode revisar conteúdos Em revisão, aprovar ou solicitar ajustes, sem permissão de publicação ou arquivamento no MVP.
- Admin pode gerenciar todos os conteúdos, usuárias administrativas, publicação, arquivamento e ações editoriais autorizadas.
- Conteúdo aprovado pode ser publicado apenas por Admin.
- Conteúdo publicado pode ser arquivado apenas por Admin.
- Todo conteúdo MUST manter histórico de alterações com versões ou registros suficientes para rastrear evolução editorial.
- Auditoria MUST registrar quem criou, editou, enviou para revisão, revisou, aprovou, publicou e arquivou conteúdo.
- Auditoria MUST registrar data e hora dos eventos relevantes, data de aprovação, estado anterior e estado resultante.
- Conteúdos publicados MUST manter autoria, revisão e aprovação associadas.

### Text Quality & Accent Requirements

- Todo texto visível no portal administrativo MUST estar em Português do Brasil.
- Textos de interface, mensagens de erro, notificações, e-mails e conteúdos educativos MUST estar corretamente acentuados.
- Conteúdos educativos publicados MUST passar por revisão ortográfica antes da publicação.
- A interface MUST NOT exibir texto sem acentuação, exceto em contextos técnicos inevitáveis, como slugs, URLs e identificadores internos.
- A busca administrativa MUST ser tolerante a acentos, permitindo encontrar “menstruacao” quando o conteúdo estiver escrito como “menstruação”.
- Resultados exibidos MUST manter a grafia correta com acentuação preservada.
- Backend, banco de dados, API, portal web e e-mails MUST usar codificação compatível com UTF-8.

### Key Entities *(include if feature involves data)*

- **Usuária administrativa**: Pessoa autorizada a acessar o portal; possui credenciais, estado de acesso, perfil administrativo e histórico de ações.
- **Perfil administrativo**: Conjunto de permissões associado a Acadêmica/autora, Revisor/professor ou Admin.
- **Conteúdo educativo**: Material informativo sobre saúde feminina; possui título, corpo, categoria ou classificação, estado editorial, autoria, revisão, aprovação, publicação, arquivamento e histórico.
- **Evento de auditoria editorial**: Registro de ação relevante sobre conteúdo ou permissão administrativa; identifica responsável, ação, data, hora, estado anterior, estado resultante e metadados necessários.
- **Histórico de alterações**: Registro de versões ou mudanças de conteúdo suficiente para rastrear evolução editorial.
- **Notificação administrativa**: Aviso no painel ou por e-mail sobre evento editorial ou ação necessária, direcionado a perfis autorizados.
- **Sintoma ou queixa**: Item não pessoal do catálogo administrativo, com nome, tipo, categoria, descrições, configuração de coleta, orientação segura, marcador de alerta e ordem de exibição.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das ações administrativas protegidas avaliadas exigem autenticação administrativa válida.
- **SC-002**: 100% das tentativas avaliadas de executar ação fora do perfil são bloqueadas.
- **SC-003**: 95% das pessoas administrativas em teste conseguem autenticar, navegar no painel e localizar suas ações permitidas sem ajuda externa.
- **SC-004**: 100% dos conteúdos publicados avaliados possuem autoria, revisão, aprovação, data de aprovação, publicação e histórico editorial rastreável.
- **SC-005**: 100% das transições editoriais inválidas avaliadas são bloqueadas.
- **SC-006**: 95% dos eventos editoriais relevantes avaliados geram auditoria com responsável, ação, data, hora e estado resultante quando aplicável.
- **SC-007**: 90% das pessoas participantes em teste conseguem completar o fluxo Rascunho → Em revisão → Aprovado → Publicado → Arquivado com os perfis corretos.
- **SC-008**: 95% das buscas administrativas testadas com termos sem acento retornam resultados equivalentes quando existir conteúdo acentuado correspondente.
- **SC-009**: 100% dos resultados de busca avaliados preservam grafia correta em Português do Brasil.
- **SC-010**: 100% das telas, mensagens, notificações administrativas, e-mails e conteúdos avaliados estão em Português do Brasil com acentuação correta, salvo slugs, URLs ou identificadores internos.
- **SC-011**: 90% das notificações administrativas avaliadas chegam ao perfil correto no painel ou por e-mail conforme regra do evento.
- **SC-012**: 0 funcionalidades específicas do app mobile, cadastro de usuárias finais, dados pessoais de saúde, push mobile, PDF, IA, integração com UBS ou monetização são incluídas no incremento.

## Assumptions

- O ecossistema futuro terá app mobile para usuárias finais, mas esse canal não será implementado agora.
- O portal administrativo será usado por pessoas vinculadas ao contexto acadêmico/editorial do produto.
- Conteúdos serão escritos principalmente por Acadêmicas/autoras e revisados por Revisores/professores antes da publicação por Admin.
- Categorias e metadados editoriais serão suficientes para organizar conteúdos no portal neste incremento; taxonomias avançadas podem evoluir depois.
- A publicação no portal prepara conteúdos para consumo futuro pelo ecossistema, mas não exige app mobile ou endpoint público para usuárias finais neste incremento.
- Notificações administrativas por e-mail informam apenas evento e ação necessária, evitando conteúdo completo e direcionando ao portal para detalhes.
- O fluxo atual não possui estado de reprovação; materiais inadequados retornam para Rascunho por solicitação de ajustes com justificativa registrada.
- Cada funcionalidade deste incremento deve entregar o menor conjunto funcional testável que comprove o fluxo administrativo e editorial.

## Scope Boundaries *(mandatory for this project)*

### Current Increment Scope

- Portal administrativo web.
- Backend Laravel API.
- Banco PostgreSQL.
- Autenticação administrativa.
- Gestão de usuárias administrativas.
- Controle de perfis e permissões administrativas.
- Perfis administrativos Acadêmica/autora, Revisor/professor e Admin.
- Cadastro e edição de conteúdos educativos.
- Revisão, aprovação, publicação e arquivamento de conteúdos.
- Fluxo editorial Rascunho → Em revisão → Aprovado → Publicado → Arquivado.
- Auditoria editorial completa: quem criou, editou, enviou para revisão, revisou, aprovou, publicou e arquivou, com data e hora dos eventos, data de aprovação e histórico de alterações.
- Notificações administrativas no painel e por e-mail.
- Conteúdos e interface em Português do Brasil com acentuação correta, cedilha e caracteres especiais.
- Busca administrativa tolerante a acentos.
- Gestão administrativa do catálogo de sintomas e queixas, sem acesso a registros individuais de saúde.
- Suporte UTF-8 no backend, banco, API, portal web e e-mails.
- Requisitos de segurança em saúde, controle de acesso, auditoria editorial, qualidade textual e preservação de acentuação.

### Out of Scope for This Increment

- App mobile.
- Cadastro e login de usuárias finais.
- Validação de e-mail de usuárias finais.
- Perfil da usuária comum.
- Ciclo menstrual.
- Registro individual de sintomas por usuárias finais e sua visualização no portal administrativo.
- Lembretes mobile.
- Push notifications mobile.
- Perguntas para consulta.
- Resumo visual para consulta.
- Biblioteca mobile de conteúdos.
- Qualquer funcionalidade específica do app mobile.
- Coleta ou tratamento de dados pessoais de saúde de usuárias finais.
- Assistente de IA.
- Integração com UBS, prontuário eletrônico ou serviços públicos.
- Exportação PDF.
- Login social.
- Monetização, anúncios e pagamentos.
- Chat com profissionais de saúde.
- Diagnóstico automatizado.
- Prescrição ou orientação de dosagem de medicamentos.
- Publicação em Google Play Store ou App Store.
- Integração com dispositivos vestíveis.

### Planned for Future Phase

- Aplicativo mobile para usuárias finais.
- Cadastro, login, validação de e-mail e perfil de usuárias finais.
- Consumo de conteúdos publicados no app mobile.
- Ciclo menstrual, sintomas, lembretes, perguntas e resumo visual para consulta.
- Push notifications mobile discretas.
- Configurações de privacidade e solicitações de gerenciamento de dados de usuárias finais.
- Publicação nas lojas de aplicativos, quando o app existir.

### Security In Health Restrictions

- Nenhuma funcionalidade do incremento pode apresentar conclusão diagnóstica.
- Nenhuma funcionalidade do incremento pode sugerir início, interrupção, troca ou dosagem de medicamento.
- Nenhuma funcionalidade do incremento pode substituir avaliação de profissional de saúde.
- Conteúdos de saúde devem ser publicados somente após revisão e aprovação por perfil autorizado.
- O incremento não terá integração com UBS, serviços públicos, prontuários ou profissionais em tempo real.
