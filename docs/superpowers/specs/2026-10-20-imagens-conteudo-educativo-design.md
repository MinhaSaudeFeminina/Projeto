# Imagens em conteúdos educativos — desenho

## Contexto e objetivo

O portal administrativo já usa TipTap para editar o corpo HTML dos conteúdos educativos, mas limita intencionalmente os recursos disponíveis. Links já podem ser inseridos; imagens não são aceitas pelo editor ou pelo sanitizador. O aplicativo móvel interpreta esse HTML com um renderizador próprio, que também não reconhece imagens.

O objetivo é permitir que autoras e administradoras colem uma imagem diretamente no editor de um conteúdo educativo. A imagem deve ser enviada e armazenada pela API, inserida no HTML com uma URL estável e exibida corretamente no aplicativo móvel. A barra do editor continuará oferecendo negrito, itálico, títulos, listas, citação, links, desfazer e refazer.

Este trabalho amplia explicitamente o escopo anterior, que excluía o aplicativo móvel, apenas para exibir as imagens de conteúdos educativos publicados.

## Decisão

Será usado upload de arquivos a partir da área de transferência. O editor detectará imagens coladas, enviará o arquivo a um endpoint administrativo autenticado e, depois do sucesso, inserirá uma tag `img` no ponto de seleção atual.

Não serão usados dados Base64 dentro do HTML: isso aumenta banco, payload e memória no aplicativo móvel. Também não serão aceitas URLs externas arbitrárias como fonte de imagem: colar uma imagem precisa funcionar sem depender de hospedeiro externo e o servidor precisa controlar as origens permitidas.

## Portal administrativo

`RichTextEditor` receberá extensão de imagem do TipTap e uma integração de clipboard para arquivos de imagem. Ao colar uma imagem, o editor manterá o texto normal do clipboard e iniciará o upload do arquivo de imagem. Enquanto houver upload, a interface exibirá estado de processamento e impedirá envios duplicados daquele arquivo. Ao terminar, inserirá a imagem responsiva no documento.

Uma ação da barra permitirá editar a descrição da imagem selecionada. Enquanto não houver descrição informada, a imagem receberá temporariamente `alt="Imagem educativa"`; a tela orientará a autora a trocar esse texto por uma descrição significativa. O editor manterá o desenho e os controles existentes, com foco preservado ao usar a barra.

## API e armazenamento

Será criado endpoint administrativo autenticado, protegido pela mesma autorização de edição de conteúdo, para receber imagens editoriais. Ele aceitará somente JPEG, PNG e WebP de até 5 MB. O servidor validará MIME e tamanho, gerará nome UUID, gravará em disco público configurado e responderá com uma URL pública absoluta, adequada ao aplicativo móvel.

O sanitizador de HTML passará a preservar somente `img` com `src` e `alt`. O valor de `src` deverá apontar para arquivo gerado pelo armazenamento editorial controlado pela aplicação; Base64, esquemas executáveis e origens não reconhecidas serão removidos. Os atributos restantes continuarão proibidos. Falhas de validação ou upload retornarão erro claro, sem inserir markup parcial.

As URLs de imagens pertencem ao corpo versionado do conteúdo. Revisões e auditoria existentes continuarão guardando o HTML resultante. A remoção física de arquivos não faz parte deste incremento para não quebrar revisões já registradas.

## Aplicativo móvel

O parser em `mobile/src/utils/richText.ts` reconhecerá a tag `img` e produzirá um bloco de imagem com URL e texto alternativo. `RichText` renderizará esse bloco com `Image` do React Native, largura fluida, proporção preservada, rótulo de acessibilidade derivado do `alt`, carregamento seguro e espaço reservado para falhas. O comportamento atual de texto, listas e links continuará inalterado.

Como o recurso mobile já recebe o campo `body` no detalhe de conteúdo publicado, não será necessário alterar o contrato desse endpoint, além de documentar que o HTML publicado pode conter imagens aprovadas pelo sanitizador.

## Erros, segurança e acessibilidade

- Arquivos sem tipo permitido, acima do limite ou que falhem no upload não entram no conteúdo; o portal mostra a falha e mantém o restante do texto.
- Apenas administradoras autorizadas a editar o conteúdo podem enviar imagens editoriais.
- O sanitizador é a barreira definitiva; o cliente não é confiável.
- Imagens usam texto alternativo editável e o mobile anuncia esse texto.
- Links preservam a validação atual (`http`, `https`, `mailto` e caminhos locais permitidos) e abrem de modo seguro no mobile.

## Testes e verificação

- Frontend: imagem colada aciona upload, URL retornada vira `img`, falha não altera documento e descrição alternativa é atualizável.
- Backend: endpoint exige autenticação/autorização, aceita tipos e tamanho válidos, rejeita entradas inválidas e sanitizador conserva apenas imagens controladas.
- Mobile: parser cria bloco de imagem e renderizador exibe URL, texto alternativo e estado de falha sem afetar links e blocos existentes.
- Contrato: OpenAPI documenta endpoint de upload e a extensão permitida do HTML editorial.
- Qualidade: testes direcionados, lint/build web e mobile, e inspeção visual do editor e da tela mobile de detalhe.
