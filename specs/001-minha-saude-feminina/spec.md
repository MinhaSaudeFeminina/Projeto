# Feature Specification: Minha Saúde Feminina

**Feature Branch**: `[001-minha-saude-feminina]`

**Created**: 2026-06-10

**Status**: Draft

**Input**: User description: "Desenvolva a especificação funcional do produto Minha Saúde Feminina, aplicativo mobile gratuito, acessível e acolhedor para apoio ao cuidado de saúde feminina, com portal administrativo web para fluxo editorial seguro de conteúdos educativos."

## Overview

Minha Saúde Feminina é um produto digital gratuito composto por aplicativo mobile para usuárias finais e portal administrativo web para gestão editorial de conteúdos educativos. O produto apoia mulheres no cuidado cotidiano com a saúde, oferece informações confiáveis em linguagem simples, permite registrar ciclo menstrual, sintomas, lembretes e perguntas para consulta, e ajuda a usuária a chegar mais preparada ao atendimento profissional.

O produto tem caráter educativo e de apoio ao autocuidado. Ele não substitui consulta médica, não diagnostica doenças, não prescreve medicamentos, não orienta automedicação e não deve induzir atraso na busca por atendimento profissional.

O portal administrativo permite que acadêmicas, professoras, tutores, revisores e administradores cadastrem, revisem, aprovem, publiquem e arquivem conteúdos educativos com rastreabilidade completa. Apenas conteúdos publicados ficam disponíveis no aplicativo mobile.

## Objectives

- Informar e orientar mulheres sobre saúde feminina em diferentes fases da vida.
- Apoiar acompanhamento pessoal de ciclo menstrual, sintomas, lembretes e dúvidas para consulta.
- Incentivar autocuidado responsável e busca por atendimento profissional quando houver sinais de alerta.
- Disponibilizar conteúdos educativos confiáveis, revisados e publicados por pessoas autorizadas.
- Garantir fluxo editorial seguro, com histórico de alterações e auditoria de eventos relevantes.
- Proteger dados pessoais e dados de saúde, tratando informações íntimas como sensíveis.
- Preservar linguagem acolhedora, acessível, sem julgamentos e em Português do Brasil com acentuação correta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acessar app com conta validada (Priority: P1)

Como usuária final, quero criar minha conta, validar meu e-mail, aceitar termos de uso e política de privacidade, e preencher meu perfil básico para acessar o aplicativo com segurança.

**Why this priority**: O acesso validado, o consentimento e o perfil básico sustentam privacidade, faixa etária, personalização de conteúdo e uso completo do app.

**Independent Test**: Pode ser testado criando uma nova conta, tentando usar o app antes e depois da validação de e-mail, aceitando os documentos obrigatórios e verificando o cálculo de idade e faixa etária.

**Acceptance Scenarios**:

1. **Given** uma pessoa sem conta, **When** ela informa nome, e-mail, senha e data de nascimento válidos, **Then** o sistema cria a conta em estado pendente de validação de e-mail.
2. **Given** uma conta com e-mail ainda não validado, **When** a usuária tenta acessar funcionalidades completas, **Then** o sistema limita o acesso e orienta a validação de e-mail.
3. **Given** uma conta com e-mail validado, **When** a usuária aceita termos de uso e política de privacidade vigentes, **Then** o sistema libera o uso completo do app.
4. **Given** uma data de nascimento válida, **When** o perfil é exibido, **Then** o sistema mostra idade e faixa etária calculadas automaticamente.

---

### User Story 2 - Consultar conteúdos educativos publicados (Priority: P1)

Como usuária final, quero acessar uma biblioteca de conteúdos educativos publicados, organizados por categoria, fase da vida e faixa etária quando aplicável, para obter orientação confiável em linguagem acolhedora.

**Why this priority**: Conteúdo educativo confiável é o principal valor público do produto e depende do fluxo editorial seguro.

**Independent Test**: Pode ser testado publicando conteúdos no portal administrativo e verificando no app que apenas conteúdos publicados aparecem, com busca tolerante a acentos e exibição com grafia correta.

**Acceptance Scenarios**:

1. **Given** conteúdos publicados e arquivados no portal, **When** a usuária acessa a biblioteca no app, **Then** somente os conteúdos publicados são exibidos.
2. **Given** um conteúdo escrito como "menstruação", **When** a usuária busca por "menstruacao", **Then** o conteúdo correspondente é encontrado e exibido com acentuação correta.
3. **Given** um conteúdo educativo sobre tema de saúde, **When** a usuária lê o conteúdo, **Then** o sistema exibe linguagem simples, indicações de quando procurar atendimento e limites do produto.

---

### User Story 3 - Registrar ciclo menstrual e sintomas (Priority: P1)

Como usuária final, quero registrar menstruação, fluxo, sintomas, intensidade e observações para acompanhar meu histórico e conversar melhor com uma profissional de saúde.

**Why this priority**: O acompanhamento pessoal é parte central do MVP e gera valor direto para preparação de consulta sem diagnosticar.

**Independent Test**: Pode ser testado registrando ciclos e sintomas, visualizando histórico e verificando que alertas orientam busca por atendimento sem sugerir diagnóstico.

**Acceptance Scenarios**:

1. **Given** uma usuária autenticada, **When** ela registra data de início e término da menstruação, **Then** o sistema salva o ciclo e o mostra no histórico.
2. **Given** um ciclo registrado, **When** a usuária informa intensidade do fluxo e sintomas associados, **Then** o sistema relaciona essas informações ao ciclo.
3. **Given** um sintoma com sinal de alerta, **When** a usuária salva o registro, **Then** o sistema orienta a procurar atendimento profissional sem diagnosticar a causa.
4. **Given** cálculo de próximo ciclo, **When** o sistema apresenta previsão, **Then** a previsão é descrita como estimativa e não como diagnóstico.

---

### User Story 4 - Gerenciar lembretes discretos de cuidado (Priority: P2)

Como usuária final, quero criar lembretes de consultas, exames, vacinas, retorno, autocuidado e uso de contraceptivo ou medicamento que eu mesma cadastrei, para receber avisos discretos no horário combinado.

**Why this priority**: Lembretes apoiam continuidade do cuidado, mas devem proteger privacidade e evitar expor dados sensíveis em notificações.

**Independent Test**: Pode ser testado criando, editando, concluindo e excluindo lembretes, e verificando que a notificação push não revela informação íntima.

**Acceptance Scenarios**:

1. **Given** uma usuária autenticada, **When** ela cria um lembrete com data, horário e categoria, **Then** o sistema agenda o lembrete e o exibe na lista da usuária.
2. **Given** um lembrete agendado para hoje, **When** chega o horário definido, **Then** o app envia notificação discreta, como "Você tem um lembrete de cuidado".
3. **Given** um lembrete existente, **When** a usuária edita, exclui ou marca como concluído, **Then** o sistema atualiza o estado do lembrete sem expor o conteúdo em logs ou mensagens.

---

### User Story 5 - Preparar resumo para consulta (Priority: P2)

Como usuária final, quero salvar perguntas e gerar um resumo visual com ciclo recente, sintomas, lembretes e perguntas para levar à consulta, com opção de copiar o texto.

**Why this priority**: O resumo aumenta a utilidade dos dados registrados e ajuda a usuária a chegar mais preparada ao atendimento profissional.

**Independent Test**: Pode ser testado criando registros e perguntas, abrindo o resumo e copiando o texto gerado, sem compartilhamento automático.

**Acceptance Scenarios**:

1. **Given** perguntas salvas e registros recentes, **When** a usuária abre o resumo para consulta, **Then** o sistema apresenta uma visão clara dos dados selecionados.
2. **Given** o resumo gerado, **When** a usuária aciona copiar texto, **Then** o texto do resumo é copiado para uso manual pela própria usuária.
3. **Given** o resumo para consulta, **When** a usuária fecha a tela, **Then** o sistema não envia nem compartilha dados automaticamente.

---

### User Story 6 - Produzir e publicar conteúdos com revisão (Priority: P1)

Como acadêmica/autora, revisora/professora ou administradora, quero executar um fluxo editorial com rascunho, revisão, aprovação, publicação e arquivamento para garantir qualidade e rastreabilidade dos conteúdos educativos.

**Why this priority**: Conteúdos de saúde exigem revisão, aprovação e auditoria antes de chegarem ao público.

**Independent Test**: Pode ser testado criando um conteúdo como autora, enviando para revisão, solicitando ajustes, aprovando, publicando e arquivando, com verificação de permissão e auditoria em cada etapa.

**Acceptance Scenarios**:

1. **Given** uma autora autenticada, **When** ela cria um conteúdo, **Then** o conteúdo fica em Rascunho e pode ser editado pela própria autora.
2. **Given** um rascunho pronto, **When** a autora envia para revisão, **Then** o conteúdo muda para Em revisão e registra o evento.
3. **Given** um conteúdo em revisão, **When** uma revisora solicita ajustes, aprova ou reprova, **Then** o sistema atualiza o estado, registra responsável, data e observação editorial quando aplicável.
4. **Given** um conteúdo aprovado, **When** uma pessoa autorizada publica o conteúdo, **Then** ele passa a aparecer no app e registra autoria, revisão, aprovação e publicação.
5. **Given** um conteúdo publicado, **When** uma pessoa autorizada arquiva o conteúdo, **Then** ele deixa de aparecer no app e o arquivamento é auditado.

---

### User Story 7 - Administrar usuários do portal (Priority: P3)

Como admin, quero gerenciar usuários administrativos e seus perfis para controlar quem pode criar, revisar, aprovar, publicar, arquivar e administrar conteúdos.

**Why this priority**: O controle de acesso por perfil é necessário para operação segura do portal, mas pode evoluir após os fluxos essenciais de conteúdo.

**Independent Test**: Pode ser testado criando ou atualizando usuários administrativos e verificando que cada perfil enxerga e executa somente as ações permitidas.

**Acceptance Scenarios**:

1. **Given** uma pessoa com perfil Admin, **When** ela acessa gestão de usuários administrativos, **Then** pode visualizar, cadastrar, editar e desativar acessos administrativos conforme regras do produto.
2. **Given** uma pessoa com perfil Acadêmica/autora, **When** ela tenta aprovar ou publicar conteúdo, **Then** o sistema bloqueia a ação e exibe mensagem clara sem expor detalhes indevidos.

### Edge Cases

- Data de nascimento futura, inválida ou incompatível com cadastro deve impedir conclusão do perfil com mensagem clara.
- Tentativa de login com e-mail não validado deve manter o bloqueio do uso completo e permitir reenvio de validação.
- Termos de uso ou política de privacidade atualizados devem exigir novo aceite antes do uso completo quando a mudança exigir consentimento renovado.
- Ciclo com data de término anterior à data de início deve ser recusado.
- Ciclo com duração ou intervalo incomum deve ser salvo apenas se a usuária confirmar, acompanhado de orientação para buscar atendimento quando aplicável.
- Sintoma com intensidade alta, sangramento fora do período, dor pélvica intensa, febre, corrimento com odor forte, coceira ou ardência persistente deve exibir orientação de busca por atendimento.
- Lembrete com texto sensível não deve aparecer integralmente em notificação push por padrão.
- Conteúdo com estado Rascunho, Em revisão, Aprovado ou Arquivado não deve aparecer no app.
- Conteúdo publicado e depois arquivado deve desaparecer da biblioteca mobile sem apagar o histórico editorial.
- Busca sem acento deve encontrar texto acentuado, mas resultados devem preservar a grafia correta.
- Falhas de envio de notificação ou e-mail administrativo devem ser indicadas sem expor conteúdo sensível.
- Usuário administrativo desativado não deve conseguir acessar o portal nem executar ações editoriais.
- Logs, erros e telas administrativas não devem exibir observações íntimas de usuárias finais sem finalidade autorizada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastro de usuária final com nome, e-mail, senha e data de nascimento.
- **FR-002**: O sistema MUST exigir validação de e-mail antes de liberar o uso completo do aplicativo mobile.
- **FR-003**: O sistema MUST exigir aceite de termos de uso e política de privacidade antes do uso completo do aplicativo.
- **FR-004**: A usuária MUST poder autenticar-se com e-mail e senha.
- **FR-005**: A usuária MUST poder visualizar e editar perfil básico com nome, e-mail e data de nascimento, respeitando regras de validação.
- **FR-006**: O sistema MUST calcular automaticamente idade e faixa etária com base na data de nascimento.
- **FR-007**: A usuária MUST poder selecionar fase de vida ou contexto relevante para sua experiência.
- **FR-008**: O aplicativo mobile MUST exibir biblioteca de conteúdos educativos publicados.
- **FR-009**: O aplicativo mobile MUST permitir filtragem ou organização de conteúdos por categoria, fase da vida e faixa etária quando aplicável.
- **FR-010**: A busca de conteúdos MUST ser tolerante a acentos e encontrar termos equivalentes sem acentuação.
- **FR-011**: Os resultados, conteúdos e interfaces MUST preservar acentos, cedilha e caracteres especiais da língua portuguesa.
- **FR-012**: A usuária MUST poder registrar data de início e data de término da menstruação.
- **FR-013**: A usuária MAY registrar intensidade de fluxo menstrual.
- **FR-014**: A usuária MUST poder associar sintomas a registros de ciclo.
- **FR-015**: O aplicativo MUST exibir histórico de ciclos menstruais da usuária.
- **FR-016**: Qualquer previsão de ciclo MUST ser apresentada como estimativa e não como diagnóstico.
- **FR-017**: A usuária MUST poder registrar sintomas com tipo, intensidade, data e observações.
- **FR-018**: O aplicativo MUST permitir registro de sintomas como cólica, dor pélvica, corrimento, coceira, ardência, sangramento fora do período menstrual, alteração de humor, dor nas mamas, ondas de calor, náuseas, cansaço e outros.
- **FR-019**: O aplicativo MUST exibir histórico de sintomas da usuária.
- **FR-020**: O aplicativo MUST orientar busca por atendimento quando registros indicarem sinais de alerta.
- **FR-021**: O aplicativo MUST NOT diagnosticar doenças a partir de ciclo, sintomas, idade, fase da vida ou qualquer combinação de dados.
- **FR-022**: A usuária MUST poder criar lembretes de consultas, exames, vacinas, retorno, autocuidado e uso de contraceptivo ou medicamento cadastrado pela própria usuária.
- **FR-023**: A usuária MUST poder editar, excluir e marcar lembretes como concluídos.
- **FR-024**: O aplicativo mobile MUST enviar push notifications para lembretes habilitados.
- **FR-025**: Notificações mobile MUST ser discretas por padrão e não expor dados sensíveis ou íntimos.
- **FR-026**: A usuária MUST poder salvar perguntas para levar à consulta.
- **FR-027**: O aplicativo MUST gerar resumo visual para consulta com sintomas, ciclo recente, lembretes e perguntas salvas.
- **FR-028**: A usuária MUST poder copiar o texto do resumo para consulta.
- **FR-029**: O aplicativo MUST NOT compartilhar dados automaticamente com terceiros, profissionais, instituições ou outros aplicativos.
- **FR-030**: A usuária MUST poder acessar configurações de privacidade e conta.
- **FR-031**: A usuária MUST poder visualizar informações básicas sobre uso de dados.
- **FR-032**: A usuária MUST poder solicitar exclusão ou gerenciamento de seus dados conforme definido pelo produto.
- **FR-033**: O portal administrativo MUST permitir login de usuários administrativos.
- **FR-034**: O portal administrativo MUST restringir acesso por perfil: Acadêmica/autora, Revisor/professor e Admin.
- **FR-035**: Acadêmica/autora MUST poder criar rascunhos de conteúdos educativos.
- **FR-036**: Acadêmica/autora MUST poder editar apenas os próprios rascunhos, salvo permissão administrativa.
- **FR-037**: Acadêmica/autora MUST poder enviar conteúdo próprio para revisão.
- **FR-038**: Revisor/professor MUST poder revisar conteúdos em revisão, aprovar, solicitar ajustes ou reprovar.
- **FR-039**: Admin MUST poder gerenciar todos os conteúdos e usuários administrativos.
- **FR-040**: O fluxo editorial MUST suportar os estados Rascunho, Em revisão, Aprovado, Publicado e Arquivado.
- **FR-041**: Conteúdo aprovado MUST poder ser publicado por perfil autorizado.
- **FR-042**: Conteúdo publicado MUST poder ser arquivado por perfil autorizado.
- **FR-043**: Conteúdo arquivado MUST NOT aparecer no aplicativo mobile.
- **FR-044**: Conteúdos educativos MUST manter histórico de alterações.
- **FR-045**: Conteúdos publicados MUST manter registro de autoria, revisão e aprovação.
- **FR-046**: O sistema MUST registrar eventos de auditoria para criação, edição, envio para revisão, revisão, aprovação, publicação e arquivamento de conteúdos.
- **FR-047**: Eventos de auditoria MUST registrar responsável, data, hora, ação executada e estado editorial resultante quando aplicável.
- **FR-048**: O sistema MUST registrar data de aprovação de conteúdos aprovados.
- **FR-049**: A auditoria MUST permitir rastrear a evolução editorial de cada conteúdo.
- **FR-050**: O portal administrativo MUST exibir notificações administrativas no painel para eventos editoriais relevantes.
- **FR-051**: O sistema MUST enviar notificações administrativas por e-mail para eventos editoriais relevantes definidos pelo produto.
- **FR-052**: Conteúdos educativos MUST abranger temas do MVP, incluindo corpo, saúde íntima, ciclo menstrual, sintomas ginecológicos, infecções, doenças ginecológicas, métodos contraceptivos, gravidez, puerpério, saúde emocional, saúde sexual, alimentação, bem-estar, exames preventivos, vacinas, climatério e menopausa.
- **FR-053**: Conteúdos educativos MUST indicar quando procurar atendimento profissional.
- **FR-054**: Conteúdos educativos MUST passar por revisão ortográfica antes da publicação.
- **FR-055**: Todo texto visível no aplicativo, portal, mensagens de erro, notificações, e-mails, termos, política de privacidade e conteúdos educativos MUST estar em Português do Brasil.

### Non-Functional Requirements

- **NFR-001**: O produto MUST ser acessível, com linguagem clara, fluxos compreensíveis, legibilidade adequada e interações consistentes.
- **NFR-002**: O aplicativo mobile MUST permitir que usuárias completem tarefas centrais em poucos passos, sem exigir conhecimento técnico ou médico.
- **NFR-003**: O portal administrativo MUST priorizar eficiência operacional para cadastro, revisão e publicação de conteúdos.
- **NFR-004**: O sistema MUST proteger dados pessoais e dados de saúde contra acesso indevido, exposição acidental e uso fora da finalidade informada.
- **NFR-005**: Logs, mensagens de erro, notificações e telas administrativas MUST evitar dados íntimos desnecessários.
- **NFR-006**: O sistema MUST preservar corretamente caracteres do Português do Brasil em telas, buscas, e-mails, notificações, conteúdos e documentos legais.
- **NFR-007**: O sistema MUST apresentar mensagens de erro compreensíveis, acolhedoras e sem julgamento.
- **NFR-008**: Funcionalidades essenciais de autenticação, conteúdo publicado, registros pessoais, lembretes e fluxo editorial MUST ter critérios de validação e teste antes de publicação do MVP.
- **NFR-009**: O produto MUST operar sem anúncios, pagamentos, monetização ou login social no MVP.

### Business Rules

- **BR-001**: O uso completo do app depende de e-mail validado e aceite vigente de termos de uso e política de privacidade.
- **BR-002**: Usuárias finais acessam apenas o aplicativo mobile; usuários administrativos acessam apenas o portal administrativo.
- **BR-003**: Dados de ciclo, sintomas, lembretes, perguntas e resumo para consulta pertencem à usuária e não devem ser compartilhados automaticamente.
- **BR-004**: Conteúdos só aparecem no app quando estiverem no estado Publicado.
- **BR-005**: Conteúdos Arquivados permanecem auditáveis, mas não aparecem para usuárias finais.
- **BR-006**: Acadêmica/autora pode criar rascunhos, editar os próprios rascunhos e enviar para revisão.
- **BR-007**: Revisor/professor pode revisar, aprovar, solicitar ajustes ou reprovar conteúdos em revisão.
- **BR-008**: Admin pode gerenciar conteúdos e usuários administrativos, respeitando auditoria.
- **BR-009**: Publicação de conteúdo exige aprovação prévia registrada.
- **BR-010**: Conteúdo publicado deve preservar autoria, revisão, aprovação, data de aprovação e histórico editorial.
- **BR-011**: Notificações de lembrete devem usar texto discreto por padrão, mesmo quando o lembrete possuir detalhes sensíveis.
- **BR-012**: Registros de sintomas e ciclo podem gerar orientações de alerta, mas nunca diagnóstico ou prescrição.
- **BR-013**: Conteúdos, interface, notificações e e-mails devem manter Português do Brasil com acentuação correta, exceto slugs, URLs e identificadores internos inevitáveis.

### Health Safety & Trust Constraints *(mandatory for this project)*

- O produto é exclusivamente educativo e de apoio ao autocuidado.
- O aplicativo e o portal MUST NOT diagnosticar doenças, prescrever medicamentos, recomendar dosagem, orientar automedicação ou substituir atendimento profissional.
- Telas de sintomas, ciclo, lembretes, conteúdos educativos e resumo para consulta MUST incluir limites claros quando houver risco de interpretação clínica indevida.
- Sinais de alerta MUST orientar a usuária a procurar UBS, profissional de saúde ou serviço de urgência, conforme gravidade descrita no conteúdo.
- Conteúdos educativos MUST indicar quando procurar atendimento profissional e devem evitar linguagem alarmista ou moralizante.
- Lembretes de contraceptivo ou medicamento só podem ser criados a partir de informação cadastrada pela própria usuária; o sistema não deve sugerir medicamento, dosagem ou conduta.

### Privacy, LGPD & Access Constraints *(mandatory for this project)*

- Dados mínimos da usuária final no MVP: nome, e-mail, senha, data de nascimento, aceite de termos e política, fase de vida ou contexto selecionado, registros de ciclo, sintomas, lembretes e perguntas salvas.
- Dados de ciclo, sintomas, lembretes de saúde, perguntas para consulta e resumo para consulta MUST ser tratados como dados de saúde ou informações íntimas sensíveis.
- O sistema MUST informar de forma compreensível as finalidades básicas de uso de dados.
- A usuária MUST poder solicitar exclusão ou gerenciamento de dados conforme definido no produto.
- Notificações push MUST ser discretas por padrão e não expor sintomas, medicamentos, contraceptivos, condições, consultas específicas ou informações íntimas.
- Logs e mensagens de erro MUST omitir, mascarar ou generalizar dados sensíveis quando não forem estritamente necessários.
- Telas administrativas MUST NOT exibir dados íntimos de usuárias finais fora de finalidade autorizada do MVP.
- Acesso administrativo MUST seguir privilégio mínimo por perfil.
- E-mails administrativos MUST evitar incluir conteúdo sensível desnecessário e devem direcionar pessoas autorizadas ao portal quando houver detalhes editoriais.
- Autenticação e autorização MUST ser centralizadas como regra de produto, com bloqueio de ações fora do perfil.

### Editorial & Audit Constraints *(mandatory when content or admin actions are involved)*

- Estados editoriais obrigatórios: Rascunho -> Em revisão -> Aprovado -> Publicado -> Arquivado.
- Acadêmica/autora pode criar conteúdos em Rascunho, editar os próprios rascunhos e enviar para revisão.
- Revisor/professor pode revisar conteúdos em revisão, aprovar, solicitar ajustes ou reprovar.
- Admin pode gerenciar todos os conteúdos, usuários administrativos e ações editoriais autorizadas.
- Conteúdo aprovado pode ser publicado por perfil autorizado.
- Conteúdo publicado pode ser arquivado por perfil autorizado.
- Todo conteúdo MUST manter histórico de alterações com versões ou registros suficientes para rastrear evolução editorial.
- Auditoria MUST registrar quem criou, editou, enviou para revisão, revisou, aprovou, publicou e arquivou conteúdo.
- Auditoria MUST registrar data e hora dos eventos relevantes, data de aprovação e estado resultante.
- Conteúdos publicados MUST manter autoria, revisão e aprovação associadas.

### Text Quality & Accent Requirements

- Todo texto visível no app mobile e no portal administrativo MUST estar em Português do Brasil.
- Textos de interface, mensagens de erro, notificações, e-mails, termos de uso, política de privacidade e conteúdos educativos MUST estar corretamente acentuados.
- Conteúdos educativos publicados MUST passar por revisão ortográfica antes da publicação.
- A interface MUST NOT exibir texto sem acentuação, exceto em contextos técnicos inevitáveis, como slugs, URLs e identificadores internos.
- A busca MUST ser tolerante a acentos, permitindo encontrar "menstruacao" quando o conteúdo estiver escrito como "menstruação".
- Resultados exibidos MUST manter a grafia correta com acentuação preservada.

### Key Entities *(include if feature involves data)*

- **Usuária final**: Pessoa que usa o aplicativo mobile; possui nome, e-mail, senha, data de nascimento, idade calculada, faixa etária, fase de vida ou contexto, aceite de termos e configurações de privacidade.
- **Usuário administrativo**: Pessoa autorizada a acessar o portal; possui perfil Acadêmica/autora, Revisor/professor ou Admin, estado de acesso e histórico de ações administrativas.
- **Conteúdo educativo**: Material informativo sobre saúde feminina; possui título, corpo, categoria, fase da vida, faixa etária quando aplicável, estado editorial, autoria, revisão, aprovação, publicação, arquivamento e histórico.
- **Evento de auditoria editorial**: Registro de ação relevante sobre conteúdo ou permissão administrativa; identifica responsável, ação, data, hora, estado anterior e estado resultante quando aplicável.
- **Registro de ciclo menstrual**: Registro pessoal da usuária com data de início, data de término, intensidade de fluxo opcional e sintomas associados.
- **Registro de sintoma**: Registro pessoal da usuária com sintoma, intensidade, data, observações e possível indicação de alerta.
- **Lembrete de saúde**: Alerta criado pela usuária com categoria, data, horário, estado, texto opcional e configuração de notificação discreta.
- **Pergunta para consulta**: Pergunta salva pela usuária para levar a atendimento profissional.
- **Resumo para consulta**: Visualização gerada para a usuária com ciclo recente, sintomas, lembretes e perguntas, com opção de copiar texto.
- **Documento legal**: Termos de uso e política de privacidade vigentes, com registro de aceite pela usuária.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% das usuárias em teste conseguem criar conta, validar e-mail, aceitar documentos obrigatórios e acessar o app sem ajuda externa.
- **SC-002**: 90% das usuárias em teste conseguem encontrar um conteúdo educativo publicado por categoria, fase da vida ou busca em até 2 minutos.
- **SC-003**: 95% das buscas testadas com termos sem acento retornam resultados equivalentes quando existir conteúdo acentuado correspondente.
- **SC-004**: 100% dos conteúdos visíveis no app estão no estado Publicado e nenhum conteúdo Arquivado aparece para usuárias finais.
- **SC-005**: 100% dos conteúdos publicados possuem autoria, revisão, aprovação, data de aprovação e histórico editorial rastreável.
- **SC-006**: 90% das usuárias em teste conseguem registrar um ciclo menstrual e um sintoma, visualizar o histórico e entender que previsões são estimativas.
- **SC-007**: 90% das usuárias em teste conseguem criar, editar, concluir e excluir um lembrete.
- **SC-008**: 100% das notificações push de lembrete avaliadas usam texto discreto e não expõem sintomas, medicamentos, contraceptivos ou informações íntimas.
- **SC-009**: 90% das usuárias em teste conseguem salvar perguntas, gerar resumo para consulta e copiar o texto sem compartilhamento automático.
- **SC-010**: 100% dos fluxos com sinais de alerta avaliados exibem orientação de busca por atendimento profissional sem diagnóstico, prescrição ou automedicação.
- **SC-011**: 95% das pessoas administrativas em teste conseguem executar seu fluxo permitido sem acessar ações fora do seu perfil.
- **SC-012**: 100% das telas, mensagens, notificações, e-mails e conteúdos avaliados no MVP estão em Português do Brasil com acentuação correta, salvo slugs, URLs ou identificadores internos.

## Assumptions

- O MVP será disponibilizado gratuitamente para público geral, incluindo comunidade acadêmica e externa.
- O produto será sustentado em contexto universitário pelo curso de Medicina, com pessoas habilitadas participando do fluxo editorial.
- A data de nascimento é necessária para cálculo de idade, faixa etária e adequação de conteúdos.
- A seleção de fase de vida ou contexto é declarada pela própria usuária e pode ser alterada conforme regras do produto.
- O app pode exibir estimativas de ciclo quando houver dados suficientes, sempre com linguagem de incerteza.
- O produto define internamente quais sinais de alerta devem gerar orientação de busca por atendimento, com base em conteúdos revisados.
- Solicitação de exclusão ou gerenciamento de dados no MVP pode seguir fluxo definido pelo produto, desde que seja claro para a usuária.
- Notificações administrativas por e-mail informam eventos editoriais, evitando conteúdo sensível desnecessário.
- Reprovação de conteúdo faz parte da revisão editorial mesmo quando não representa estado final permanente no fluxo principal descrito.
- O MVP não inclui atendimento em tempo real, triagem clínica automatizada ou integração com serviços de saúde.

## Scope Boundaries *(mandatory for this project)*

### MVP Scope

- Aplicativo mobile para usuárias finais com cadastro, login por e-mail e senha, validação obrigatória de e-mail, aceite de termos e política, perfil, idade e faixa etária, fase de vida ou contexto, biblioteca de conteúdos publicados, ciclo menstrual, sintomas, lembretes com push notification, perguntas para consulta, resumo visual copiável e configurações de privacidade e conta.
- Portal administrativo web com login, acesso por perfil, perfis Acadêmica/autora, Revisor/professor e Admin, cadastro e edição de conteúdos, fluxo editorial, revisão, aprovação, solicitação de ajustes, publicação, arquivamento, auditoria, gestão básica de usuários administrativos e notificações no painel e por e-mail.
- Conteúdos educativos sobre os temas definidos no MVP, organizados por categoria, fase da vida e faixa etária quando aplicável.
- Requisitos de segurança em saúde, LGPD, privacidade, auditoria editorial, qualidade textual e preservação de acentuação.

### Out of Scope

- Assistente de IA.
- Integração com UBS, prontuário eletrônico ou serviços públicos.
- Exportação em PDF.
- Login social.
- Monetização, anúncios e pagamentos.
- Chat com profissionais de saúde.
- Diagnóstico automatizado.
- Prescrição ou orientação de dosagem de medicamentos.
- Publicação automática nas lojas.
- Integração com dispositivos vestíveis.

### Security In Health Restrictions

- Nenhuma funcionalidade do MVP pode apresentar conclusão diagnóstica.
- Nenhuma funcionalidade do MVP pode sugerir início, interrupção, troca ou dosagem de medicamento.
- Nenhuma funcionalidade do MVP pode substituir avaliação de profissional de saúde.
- Orientações de alerta devem favorecer busca por atendimento quando houver risco.
- Conteúdos de saúde devem ser publicados somente após revisão e aprovação por perfil autorizado.
