# Validação da URL pública do site

## Objetivo

Impedir que o build do Next.js falhe quando `NEXT_PUBLIC_SITE_URL` estiver ausente, vazia ou contiver uma URL inválida, mantendo metadados, `robots.txt` e `sitemap.xml` consistentes.

## Solução

Criar um pequeno utilitário server-side que resolva a URL pública do site. Ele deve remover espaços externos, aceitar somente URLs absolutas com protocolo `http:` ou `https:` e retornar `http://localhost:3000` quando o valor não for utilizável.

O `layout`, o gerador de `robots.txt` e o gerador de `sitemap.xml` devem consumir essa mesma fonte. O utilitário fornecerá uma instância de `URL` para `metadataBase` e uma representação textual sem barra final para composição de caminhos.

## Tratamento de erros

Valores ausentes, vazios, relativos, sem protocolo ou com protocolos não HTTP não devem lançar erros durante a avaliação dos módulos. Todos devem cair no fallback local. A configuração correta no ambiente de produção continua sendo necessária para gerar URLs públicas canônicas.

## Testes e verificação

- Testar o resolvedor com URL HTTPS válida, espaços externos, valor vazio e valor inválido.
- Executar os testes automatizados e a verificação de tipos.
- Executar o build com `NEXT_PUBLIC_SITE_URL` vazio para reproduzir o cenário do deploy.
- Confirmar que `layout`, `robots` e `sitemap` usam o resolvedor compartilhado.

## Fora do escopo

Não alterar a plataforma de deploy, domínios, conteúdo dos metadados ou outras funcionalidades da aplicação.
