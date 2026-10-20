# Minha Saúde Feminina Backend

API Laravel do incremento administrativo do Minha Saúde Feminina.

Este backend atende somente o portal administrativo web neste incremento. O app mobile, usuários finais comuns e endpoints específicos do app ficam fora do escopo ativo.

## Ambiente

- PHP 8.2 ou superior, conforme versão suportada pelo projeto Laravel.
- Laravel 11.x/12.x ou versão vigente instalada no projeto.
- PostgreSQL como banco relacional principal.
- API REST versionada para o portal administrativo, com prefixo esperado `/api/v1/admin`.
- Autenticação administrativa por sessão/token revogável.
- Mailer configurado em modo `log`, sandbox ou serviço transacional durante desenvolvimento.

## Variáveis Esperadas

Configurações mínimas esperadas no `.env` ou ambiente equivalente:

- `APP_URL`
- `APP_LOCALE=pt_BR`
- `APP_FALLBACK_LOCALE=pt_BR`
- `APP_FAKER_LOCALE=pt_BR`
- `DB_CONNECTION=pgsql`
- `DB_HOST`
- `DB_PORT=5432`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `MAIL_MAILER`
- `MAIL_FROM_ADDRESS`
- `MAIL_FROM_NAME`
- `FRONTEND_URL`

## PostgreSQL e UTF-8

O banco PostgreSQL deve ser criado com encoding UTF-8. Textos de conteúdos, categorias, fases da vida, faixas etárias, auditoria e notificações administrativas devem preservar acentos, cedilha e caracteres especiais.

Exemplo de expectativa para banco:

```sql
CREATE DATABASE woman_health
  WITH ENCODING 'UTF8'
  TEMPLATE template0;
```

Respostas JSON, validações, e-mails e logs devem ser produzidos considerando UTF-8. Quando aplicável, respostas devem usar `Content-Type: application/json; charset=UTF-8`.

## Escopo da API Administrativa

Este incremento cobre:

- Autenticação administrativa.
- Gestão de usuários administrativos.
- Perfis e permissões administrativas.
- Categorias de conteúdo.
- Fases da vida e faixas etárias associadas a conteúdos.
- Gestão de conteúdos educativos.
- Fluxo editorial condicionado ao papel: aluno/acadêmica autora passa por Rascunho → Em revisão → Aprovado antes de publicar o próprio conteúdo; professor/revisor e Admin criam diretamente em Aprovado e podem publicá-lo. O arquivamento permanece explícito e exclusivo de Admin.
- Auditoria editorial e histórico de alterações.
- Notificações administrativas no painel e por e-mail.
- Busca administrativa tolerante a acentos.

Todas as rotas deste incremento usam o prefixo `/api/v1/admin`. O contrato em
`specs/001-minha-saude-feminina/contracts/openapi.yaml` é verificado por teste
contra as rotas Laravel ativas para impedir endpoints administrativos sem
documentação.

## Perfis Administrativos

- Aluno/acadêmica autora: cria rascunhos, edita os próprios rascunhos, envia para revisão obrigatória e publica somente o próprio conteúdo aprovado.
- Revisor/professor: cria conteúdo diretamente Aprovado, publica conteúdo Aprovado sem segunda revisão e revisa conteúdo de alunos/autoras.
- Admin: cria conteúdo diretamente Aprovado, publica conteúdo Aprovado e gerencia usuários administrativos, permissões, conteúdos e arquivamento.

O backend deve aplicar permissões com middleware e policies. O portal pode ocultar ações, mas não é a fonte final de autorização.

## Fluxo Editorial

O ciclo de aluno/acadêmica autora é `Rascunho → Em revisão → Aprovado →
Publicado → Arquivado`. Conteúdo de Revisor/professor ou Admin entra diretamente
em `Aprovado`, com autoria e autorização por papel registradas, sem segunda
revisão. Professores/revisores e Admins publicam conteúdo Aprovado; alunos
publicam somente o próprio conteúdo após revisão, e apenas Admins arquivam. Cada transição gera
auditoria append-only e os snapshots preservam o histórico.

## Auditoria e Logs

Eventos editoriais e administrativos relevantes devem registrar ator, ação, data/hora, estado anterior, estado resultante e comentário quando aplicável.

Logs não devem expor:

- Senhas.
- Tokens.
- Dados internos de segurança.
- Conteúdo completo desnecessário.
- Payloads sensíveis ou extensos sem finalidade operacional clara.

## E-mails Administrativos

E-mails administrativos devem:

- Estar em Português do Brasil.
- Preservar acentuação, cedilha e caracteres especiais.
- Informar evento e ação necessária.
- Direcionar a pessoa autorizada ao portal administrativo.
- Evitar carregar o conteúdo editorial completo quando o portal autenticado puder exibir os detalhes.

## Fora do Escopo deste Incremento

- App mobile.
- React Native ou Expo.
- Cadastro, login, validação de e-mail ou perfil de usuárias finais.
- Ciclo menstrual.
- Registro de sintomas.
- Lembretes mobile.
- Push notifications mobile.
- Perguntas para consulta.
- Resumo visual para consulta.
- Assistente de IA.
- Integração com UBS, prontuário eletrônico ou serviços públicos.
- Exportação PDF.
- Monetização, anúncios ou pagamentos.
- Diagnóstico automatizado, prescrição ou orientação de dosagem.

Não devem ser adicionadas rotas ativas de autenticação de usuárias finais,
ciclo, sintomas, lembretes, push ou consumo mobile de conteúdo. O estado e os
metadados de conteúdos publicados apenas preparam uma integração futura.

## Verificação

Execute a suíte definida em `phpunit.xml`:

```powershell
php artisan test --configuration phpunit.xml
```

Os testes cobrem autorização, fluxo editorial, auditoria, notificações,
minimização de dados sensíveis, UTF-8, busca tolerante a acentos, contrato
OpenAPI e a ausência de rotas mobile deste incremento.
