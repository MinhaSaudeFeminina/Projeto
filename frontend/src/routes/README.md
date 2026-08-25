# Rotas e Layout do Portal Administrativo

Este diretório define as rotas do portal administrativo web em React/TypeScript. O escopo ativo é somente browser administrativo consumindo a API Laravel em `/api/v1/admin`.

## Escopo de Rotas

Rotas permitidas neste incremento:

- Login administrativo.
- Dashboard administrativo.
- Gestão de conteúdos educativos.
- Criação e edição de rascunhos.
- Envio para revisão.
- Fila e tela de revisão.
- Aprovação e solicitação de ajustes.
- Publicação e arquivamento.
- Auditoria e histórico.
- Gestão de usuários administrativos.
- Notificações administrativas.
- Busca e filtros de conteúdos.

Não criar rotas para app mobile, cadastro/login de usuárias finais, perfil de usuária comum, ciclo menstrual, sintomas, lembretes, push mobile, perguntas para consulta, resumo visual, assistente de IA, UBS, PDF ou monetização.

## Convenções de Caminhos

- Usar `/admin/login` para acesso público administrativo.
- Usar `/admin` como raiz autenticada do portal.
- Usar caminhos administrativos claros, por exemplo:
  - `/admin/dashboard`
  - `/admin/contents`
  - `/admin/contents/new`
  - `/admin/contents/:id`
  - `/admin/contents/:id/audit`
  - `/admin/review`
  - `/admin/users`
  - `/admin/notifications`
- Não misturar rotas administrativas com rotas públicas ou futuras rotas mobile.

## Guards de Autenticação e Perfil

- Toda rota sob `/admin`, exceto `/admin/login`, exige usuário administrativo autenticado.
- Usuários administrativos inativos devem ser redirecionados para login ou tela de acesso negado.
- A UI pode ocultar ações indisponíveis, mas o backend continua sendo a fonte decisiva de autorização.
- Guards por perfil devem refletir os perfis canônicos:
  - `academic_author`: cria, edita e envia próprios rascunhos para revisão.
  - `reviewer_professor`: acessa revisão, solicita ajustes e aprova.
  - `admin`: gerencia usuários, permissões, taxonomias, publicação, arquivamento, auditoria e notificações.

## Layout Administrativo

- Rotas autenticadas devem usar um layout administrativo comum com navegação, identidade da usuária administrativa, indicação de notificações e ação de logout.
- A navegação deve exibir apenas itens compatíveis com o perfil atual.
- Estados de carregamento, erro, acesso negado e sessão expirada devem ser tratados de forma consistente.
- Textos da interface devem estar em Português do Brasil e preservar acentuação, cedilha e caracteres especiais.

## Fluxo Editorial na Navegação

- Conteúdos em `draft` devem direcionar autoras para edição e envio para revisão.
- Conteúdos em `in_review` devem aparecer na fila de revisão para revisor/professor e Admin.
- Conteúdos `approved` devem expor ação de publicação apenas para Admin.
- Conteúdos `published` devem expor ação de arquivamento apenas para Admin.
- Conteúdos `archived` devem ficar consultáveis conforme permissão, sem ações editoriais indevidas.

## Acessibilidade e UX

- Rotas principais devem ser navegáveis por teclado.
- Mudanças de página devem manter foco previsível no conteúdo principal.
- Mensagens de erro, vazio e acesso negado devem ser curtas, claras e em PT-BR.
- Componentes de layout não devem depender de dados do frontend para autorizar ações sensíveis; devem apenas refletir permissões já conhecidas.
