<!--
Sync Impact Report
- Version change: 2.0.0 -> 3.0.0
- Modified principles:
  - V. Fluxo Editorial e Auditoria: permite publicação direta por
    professor/revisor e Admin e publicação do próprio conteúdo pelo aluno
    somente após revisão e aprovação autorizadas; arquivamento segue Admin-only.
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - ✅ updated .specify/templates/plan-template.md
  - ✅ updated .specify/templates/spec-template.md
  - ✅ updated .specify/templates/tasks-template.md
  - ⚠ .specify/templates/commands/*.md não existe no repositório
- Follow-up TODOs: none
-->
# Minha Saude Feminina Constitution

## Core Principles

### I. Seguranca em Saude
O produto MUST fornecer informacao educativa e apoio ao autocuidado sem se
apresentar como substituto de atendimento medico. Nenhum fluxo do app, portal ou
API pode diagnosticar doencas, prescrever medicamentos, sugerir automedicacao ou
induzir atraso na busca por cuidado profissional. Sinais de alerta MUST resultar
em orientacao clara para procurar UBS, profissional de saude ou servico de
urgencia. Todo conteudo de saude MUST ser escrito, revisado e publicado somente
por pessoas autorizadas no fluxo editorial. Rationale: seguranca clinica e
reducao de risco regulatorio dependem de limites explicitos do produto.

### II. Linguagem Acolhedora
Toda comunicacao destinada a usuarias e equipes MUST usar linguagem simples,
respeitosa, acessivel e sem julgamentos. O produto MUST respeitar diversidade,
autonomia, privacidade e diferentes fases da vida da mulher. Textos, notificacoes
e mensagens de erro MUST evitar linguagem alarmista, discriminatoria ou
moralizante. Rationale: cuidado digital exige compreensao, confianca e respeito
em todas as interacoes.

### III. Privacidade, LGPD e Dados Sensiveis
O sistema MUST coletar apenas dados necessarios para cada finalidade declarada e
MUST tratar dados de saude como dados sensiveis. O uso do produto MUST exigir
aceite de termos de uso e politica de privacidade antes do uso completo. A
usuaria MUST conseguir gerenciar seus dados conforme as capacidades previstas no
produto. Informacoes intimas MUST NOT aparecer por padrao em notificacoes mobile,
logs, telas administrativas ou mensagens de erro; notificacoes mobile MUST ser
discretas por padrao. Rationale: minimizacao, confidencialidade e transparencia
sao obrigatorias para conformidade com a LGPD e para preservar confianca.

### IV. Autenticacao, Acesso e Permissoes
Usuarias comuns MUST acessar apenas o aplicativo mobile, e usuarios
administrativos MUST acessar apenas o portal web. O cadastro da usuaria MUST
validar e-mail antes de liberar uso completo do app. O backend MUST centralizar
autenticacao, autorizacao, permissoes e enforcement de politicas para todos os
canais. O portal administrativo MUST aplicar controle de acesso por perfis e
permissoes com privilegio minimo. Rationale: separacao de contextos e controle de
acesso reduzem exposicao indevida e erro operacional.

### V. Fluxo Editorial e Auditoria
Os estados editoriais MUST permanecer Rascunho -> Em revisao -> Aprovado ->
Publicado -> Arquivado, com entrada condicionada ao papel da pessoa autora.
Conteudo criado por aluno ou academica/autora MUST iniciar em Rascunho e MUST
ser revisado e aprovado por professor/revisor ou Admin antes que a propria
pessoa autora possa publica-lo. Conteudo criado por professor/revisor ou Admin
MAY iniciar em Aprovado, sem segunda revisao ou aprovacao, e esses perfis MUST
poder publica-lo diretamente, desde que a autoria, o papel autorizador e a data
sejam registrados. A publicacao MUST continuar sendo uma acao explicita e
auditada. O arquivamento MUST permanecer exclusivo de Admin. Administradores
MUST poder gerenciar todo o processo. O sistema MUST
registrar quem criou, editou, enviou para revisao, revisou ou autorizou,
publicou e arquivou conteudos, com data e hora, e MUST manter historico de
alteracoes. Rationale: a qualificacao do professor e a autoridade do Admin
eliminam revisao redundante, enquanto a revisao previa do conteudo estudantil
protege a publicacao sem retirar a autonomia da pessoa autora, sempre com
rastreabilidade obrigatoria para conteudo de saude.

### VI. Acessibilidade e Experiencia
O aplicativo mobile MUST ser simples, intuitivo e acessivel para usuarias finais.
O portal administrativo MUST priorizar objetividade e eficiencia operacional.
Textos do MVP destinados a usuarias e administradores MUST estar em Portugues do
Brasil. Interfaces MUST priorizar clareza, legibilidade e consistencia visual.
Rationale: acessibilidade e compreensao sao parte do valor do produto, nao um
acabamento opcional.

### VII. Desenvolvimento Incremental e Escopo de MVP
Planejamento e implementacao MUST priorizar um MVP funcional antes de recursos
avancados. Solucoes MUST evitar overengineering e favorecer modulos testaveis,
documentados e evolutivos. Assistente de IA, integracao com UBS, exportacao em
PDF e monetizacao MUST permanecer fora do MVP, salvo emenda explicita desta
constituicao ou aprovacao formal equivalente. Rationale: foco de escopo e
entregas menores reduzem risco e aumentam capacidade de validacao real.

### VIII. Arquitetura Integrada e Responsabilidades por Canal
O projeto MUST ser composto por aplicativo mobile para usuarias finais, portal
administrativo web para gestao de conteudos e API backend como fonte central de
regras, dados, autenticacao, permissoes e auditoria. Regras de negocio
compartilhadas MUST residir no backend ou em contratos formalmente versionados,
nao duplicadas de forma divergente entre canais. Cada feature MUST declarar qual
canal ela afeta e quais politicas centrais do backend aplica. Rationale: a
consistencia do dominio depende de fronteiras claras e de uma fonte unica para
decisoes sensiveis.

### IX. Arquitetura Integrada e Responsabilidades por Canal
- Todo texto exibido para usuárias finais e usuários administrativos deve estar em Português do Brasil.
- O sistema deve preservar acentuação, cedilha e caracteres especiais da língua portuguesa.
- Conteúdos, botões, mensagens, notificações, validações, e-mails e textos institucionais devem passar por revisão ortográfica.
- A interface não deve exibir textos sem acentuação, exceto em contextos técnicos inevitáveis, como slugs, URLs ou identificadores internos.
- O sistema deve usar codificação compatível com UTF-8 em banco de dados, API, frontend mobile, frontend web e envio de e-mails.
- A busca pode ser tolerante a acentos, por exemplo permitindo encontrar “menstruacao” mesmo que o conteúdo esteja escrito como “menstruação”, mas o conteúdo exibido deve manter a acentuação correta.

## Restricoes Operacionais e de Produto

- Fluxos clinicos MUST exibir limites do produto quando houver risco de a usuaria
  interpretar o conteudo como diagnostico, prescricao ou substituicao de cuidado.
- Historicos, logs e observabilidade MUST mascarar ou omitir dados sensiveis
  sempre que o valor operacional puder ser preservado.
- Eventos de auditoria MUST ser considerados requisito funcional para qualquer
  feature que altere conteudo editorial, permissao, autenticacao ou dado sensivel.
- Especificacoes MUST declarar criterios de exclusao de escopo quando a feature
  tocar itens fora do MVP.
- Decisoes que ampliem coleta de dados, visibilidade de informacoes intimas ou
  poderes administrativos MUST incluir justificativa explicita e impacto em LGPD.

## Governanca de Especificacao, Planejamento e Entrega

- Toda especificacao MUST identificar o canal afetado, os tipos de dados
  sensiveis envolvidos, os papeis com acesso e os riscos de seguranca em saude.
- Toda especificacao de conteudo MUST declarar estados editoriais, atores do fluxo
  e requisitos de auditoria aplicaveis.
- Todo plano tecnico MUST falhar na Constitution Check se nao explicar: limites
  clinicos do fluxo, estrategia de privacidade, controle de acesso, requisitos de
  auditoria, acessibilidade e aderencia ao escopo de MVP.
- Toda lista de tarefas MUST incluir trabalho explicito para validacao de acesso,
  aceite de termos quando aplicavel, protecao de dados sensiveis, rastreabilidade
  editorial e documentacao.
- Implementacoes MUST ser revisadas contra esta constituicao antes de merge.
  Violacoes apenas podem ocorrer com registro formal na secao de complexidade ou
  excecao equivalente, incluindo justificativa, risco aceito e plano de remocao.
- Mudancas em principios, estados editoriais, papeis de acesso ou limites do MVP
  MUST atualizar esta constituicao e os templates dependentes no mesmo trabalho.

## Governance

Esta constituicao prevalece sobre praticas locais e orienta especificacao,
planejamento, tarefas, implementacao, revisao e evolucao do produto. Emendas
MUST ser registradas por escrito, identificar impacto em seguranca em saude,
privacidade, auditoria, papeis de acesso, arquitetura e escopo de MVP, e MUST
atualizar os artefatos dependentes na mesma alteracao.

Versionamento da constituicao MUST seguir semantic versioning: MAJOR para
remocoes ou redefinicoes incompativeis de principios ou governanca; MINOR para
novos principios, novas secoes normativas ou expansao material de regras; PATCH
para esclarecimentos sem mudanca normativa. Revisoes de conformidade MUST ocorrer
em cada especificacao, em cada plano tecnico e antes de merge de implementacoes
que toquem autenticacao, dados sensiveis, conteudo editorial, notificacoes ou
auditoria.

Quando houver conflito entre velocidade de entrega e estes principios, a decisao
padrao MUST favorecer seguranca em saude, privacidade, rastreabilidade e foco no
MVP. Excecoes temporarias MUST ter responsavel nomeado, prazo e criterio de
encerramento documentados.

**Version**: 3.0.0 | **Ratified**: 2026-06-10 | **Last Amended**: 2026-10-20
