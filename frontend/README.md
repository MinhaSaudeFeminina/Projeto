# Minha Saúde Feminina — Portal Administrativo

Portal React/TypeScript do incremento administrativo e editorial. A interface
consome exclusivamente a API Laravel sob `/api/v1/admin`; app mobile e fluxos de
usuárias finais não fazem parte desta entrega.

## Perfis e responsabilidades

- **Acadêmica/autora**: cria e edita os próprios rascunhos e os envia para revisão.
- **Revisor/professor**: consulta a fila, aprova conteúdos ou solicita ajustes.
- **Admin**: gerencia pessoas administrativas, publica, arquiva e acompanha todo o processo.

O frontend adapta navegação e ações ao perfil autenticado, mas a autorização
definitiva é aplicada pelo backend.

## Fluxo editorial

As telas acompanham `Rascunho → Em revisão → Aprovado → Publicado → Arquivado`,
incluindo fila de revisão, comentários de ajuste, auditoria, histórico e
notificações administrativas.

## Português do Brasil e acessibilidade

Todo texto visível deve permanecer em Português do Brasil e UTF-8, preservando
acentos e cedilha. Slugs e identificadores técnicos podem ser normalizados. A
busca aceita termos sem acento, mas os resultados mantêm a grafia original.

Formulários devem associar rótulos aos controles; botões e links precisam de
nome acessível; estados de erro usam mensagens compreensíveis e regiões
semânticas apropriadas. Há regressões automatizadas para os fluxos principais.

## Desenvolvimento

```powershell
npm install
npm run dev
```

Configure a URL da API conforme o ambiente e use uma conta administrativa ativa.

## Verificação

```powershell
npm test
npm run lint
npm run build
```

A suíte Vitest cobre login, proteção de rotas, dashboard, pessoas
administrativas, conteúdo, revisão, auditoria, notificações, acessibilidade e
renderização global de acentos.
