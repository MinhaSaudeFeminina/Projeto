# Cliente da API Administrativa

Este diretório contém os clientes TypeScript usados pelo portal administrativo web para consumir a API Laravel do incremento atual. O escopo ativo é somente administrativo: não criar clientes para app mobile, usuárias finais, ciclo menstrual, sintomas, lembretes, push ou consulta.

## Convenções de URL

- O backend expõe endpoints administrativos em `/api/v1/admin`.
- O cliente base pode usar `VITE_API_BASE_URL` apontando para `/api/v1`; os serviços específicos devem chamar caminhos iniciados por `/admin/...`.
- Em ambientes locais, a URL esperada é `http://localhost:8000/api/v1`.
- O portal web local usa `http://localhost:5173`.

## Autenticação

- Toda chamada protegida deve receber token administrativo revogável.
- O token deve ser enviado no header `Authorization: Bearer <token>`.
- Não registrar tokens, senhas, payloads de login ou respostas sensíveis em `console.log`, erros genéricos ou telemetria.
- Usuários administrativos inativos ou sem perfil válido devem ser tratados como acesso negado.

## JSON, UTF-8 e Português do Brasil

- Todas as requisições JSON devem enviar `Accept: application/json` e `Content-Type: application/json; charset=UTF-8`.
- Títulos, resumos, corpos de conteúdo, categorias, fases da vida, faixas etárias, mensagens e nomes devem preservar acentuação, cedilha e caracteres especiais.
- A busca administrativa pode enviar termos sem acento, como `menstruacao`, mas a grafia exibida deve continuar correta, como `menstruação`.
- Slugs e URLs podem ser normalizados sem acento; textos editoriais nunca devem ser sobrescritos por versões normalizadas.

## Tratamento de Respostas

- Serviços devem retornar tipos explícitos para cada contrato consumido.
- Respostas `204` devem ser tratadas como sucesso sem corpo.
- Mensagens de erro mostradas na interface devem estar em Português do Brasil.
- Erros técnicos do backend não devem vazar detalhes internos, tokens, senhas ou stack traces para a tela.

## Organização dos Serviços

- `client.ts`: cliente HTTP compartilhado e regras comuns de headers, autenticação e erros.
- `adminAuthApi.ts`: login, logout e sessão administrativa atual.
- `adminUserApi.ts`: gestão de usuários administrativos, quando implementado.
- `rolePermissionApi.ts`: leitura de perfis e permissões, quando implementado.
- `contentApi.ts`: listagem, criação, edição, busca e filtros de conteúdos educativos.
- `taxonomyApi.ts`: categorias, fases da vida e faixas etárias, quando implementado.
- `editorialApi.ts`: envio para revisão, solicitação de ajustes, aprovação, publicação e arquivamento.
- `auditApi.ts`: auditoria e histórico editorial, quando implementado.
- `notificationApi.ts`: notificações administrativas no painel, quando implementado.

## Limites do Incremento

- Não implementar consumo de endpoints mobile neste diretório.
- Não criar autenticação de usuárias finais.
- Não criar clientes para assistente de IA, UBS, PDF, monetização ou push mobile.
- O frontend pode preparar a visualização de conteúdos publicados para uso administrativo, mas o consumo pelo app mobile fica fora deste incremento.
