# Policies Administrativas

Policies Laravel são a camada decisiva de autorização do backend para o incremento administrativo/editorial. O frontend pode ocultar ações indisponíveis, mas nunca deve ser a fonte de enforcement.

## Escopo Ativo

As policies deste incremento cobrem somente:

- Usuários administrativos.
- Perfis e permissões administrativas.
- Conteúdos educativos.
- Categorias, fases da vida e faixas etárias.
- Fluxo editorial.
- Auditoria e histórico.
- Notificações administrativas.

Não criar policies para app mobile, usuárias finais, ciclo menstrual, sintomas, lembretes, perguntas para consulta, resumo visual, assistente de IA, UBS, PDF, monetização ou login social.

## Perfis Canônicos

- `academic_author`: representa aluno/acadêmica autora, cria conteúdos em `draft`, edita apenas rascunhos próprios, envia-os para revisão obrigatória e publica somente o próprio conteúdo aprovado.
- `reviewer_professor`: cria conteúdo diretamente em `approved`, publica conteúdo aprovado sem segunda revisão e acessa conteúdos de alunos/autoras em `in_review` para solicitar ajustes ou aprovar.
- `admin`: publica conteúdos aprovados e gerencia usuários administrativos, perfis, permissões, taxonomias, todos os conteúdos, arquivamento, auditoria e notificações.

Permissões granulares podem existir no banco, mas devem reforçar esses perfis canônicos, não abrir comportamento fora do MVP.

## Convenções de Implementação

- Policies devem negar por padrão quando usuário, perfil, permissão ou estado do recurso não forem válidos.
- Métodos devem retornar decisões booleanas ou respostas explícitas de autorização do Laravel, sem efeitos colaterais.
- Regras dependentes de estado editorial devem validar tanto o perfil quanto o status atual do conteúdo.
- Services executam regras de domínio; policies decidem se o ator pode executar a ação.
- Controllers e Form Requests devem chamar authorization/policies antes de executar mutações.
- Mensagens de negação expostas pela API devem ser genéricas e em Português do Brasil.

## Regras de Conteúdo

- Criar conteúdo: `academic_author` cria em `draft`; `reviewer_professor` e `admin` criam em `approved`, com autorização por papel auditada.
- Editar rascunho próprio: autora do conteúdo em `draft`.
- Editar qualquer conteúdo permitido: `admin`, conforme estado e operação.
- Enviar para revisão: autora do rascunho próprio ou `admin`.
- Solicitar ajustes: `reviewer_professor` ou `admin` quando o conteúdo está em `in_review`.
- Aprovar: `reviewer_professor` ou `admin` quando o conteúdo está em `in_review`.
- Publicar: `reviewer_professor` ou `admin` quando o conteúdo está em `approved`; `academic_author` somente quando é a pessoa autora e há aprovação registrada por professor/revisor ou Admin.
- Arquivar: somente `admin` quando o conteúdo está em `published`.
- Ver auditoria e histórico: `reviewer_professor` e `admin`; autora pode ver histórico dos próprios conteúdos quando a regra da tela permitir.

## Regras de Administração

- Criar, editar, desativar e reativar usuários administrativos: somente `admin`.
- Alterar perfil ou permissões: somente `admin`.
- Gerenciar categorias e taxonomias: somente `admin`.
- Ler perfis e permissões para montar telas administrativas: usuários autenticados podem ler quando necessário para uma tela autorizada; mutações continuam restritas a `admin`.

## Segurança e Auditoria

- Não usar dados enviados pelo frontend como prova de permissão.
- Não autorizar ações em usuários administrativos inativos.
- Não expor motivo detalhado de falha quando isso revelar existência de usuário, recurso ou permissão interna.
- Toda mutação autorizada relevante deve ser auditada por services/controllers apropriados após a decisão da policy.
- Policies não devem registrar tokens, senhas ou payloads sensíveis em logs.
