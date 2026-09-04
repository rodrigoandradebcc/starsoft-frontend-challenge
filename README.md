# Starsoft NFT Marketplace

Marketplace responsivo de itens digitais desenvolvido para o desafio front-end da Starsoft. A
aplicação consome a API pública atual, renderiza a primeira página no servidor e mantém um carrinho
de compras persistente no navegador.

## Demonstração

- **Aplicação publicada:** <https://starsoft-frontend-challenge-one.vercel.app/>
- **Vídeo de demonstração:** <https://jam.dev/c/43e93671-9f8a-427e-a016-5c5b1c96cdef>

## Funcionalidades

- Listagem paginada com “Carregar mais” e indicador de progresso
- Página dinâmica de detalhes em `/products/[id]`
- Carrinho lateral com quantidade, remoção, total e finalização simulada
- Persistência do carrinho em `localStorage`
- Estados de carregamento, erro, vazio e produto não encontrado
- Layout responsivo, navegação por teclado e suporte a movimento reduzido
- Metadados, sitemap e robots para SEO

## Tecnologias e decisões técnicas

| Escolha | Por quê |
| --- | --- |
| **Next.js 16 (App Router)** | Server Components permitem buscar o catálogo no servidor e enviar HTML já preenchido, sem custo de JavaScript para a listagem inicial. `revalidate = 300` dá ISR: páginas estáticas revalidadas a cada 5 minutos, combinando velocidade de SSG com dados atualizados. |
| **React 19 + TypeScript** | Tipagem estática no contrato da API (`src/lib/api/types.ts`) evita erros de integração em tempo de build. O `strict` está ligado e `tsc --noEmit` faz parte do `npm run check`. |
| **TanStack React Query** | Estado de servidor tem regras próprias (cache, revalidação, paginação, retry) que um reducer não resolve bem. `useInfiniteQuery` cobre o “Carregar mais” e a hidratação via `HydrationBoundary` reaproveita no cliente o que já foi buscado no servidor, sem refetch duplicado. |
| **Redux Toolkit** | Reservado ao estado de cliente: itens do carrinho (`cartSlice`) e abertura do drawer (`uiSlice`). É estado compartilhado entre Header, drawer e páginas de produto — Context puro re-renderizaria a árvore inteira a cada mudança de quantidade. RTK ainda entrega reducers imutáveis e serializáveis, fáceis de testar isoladamente. |
| **Separação Query × Redux** | Regra do projeto: **dados do servidor no React Query, dados do usuário no Redux**. Evita duplicar o catálogo na store e manter cache manualmente. |
| **SASS Modules** | Escopo local de classes sem runtime de CSS-in-JS (custo que Styled Components cobraria em Server Components). Tokens de design ficam em `src/styles/globals.scss`; `_mixins.scss` e `_variables.scss` centralizam breakpoints e espaçamentos. |
| **Framer Motion** | Animações declarativas com suporte nativo a `prefers-reduced-motion` e a saída de elementos (`AnimatePresence`), necessário para o drawer e para as transições de página. |
| **Camada de serviço isolada** | `apiFetch` concentra base URL, cabeçalhos, `next: { revalidate }` e erros tipados (`ApiError`); `products.service.ts` traduz o contrato bruto da API para o modelo interno. Trocar de endpoint ou de formato afeta um arquivo só. |
| **Jest + React Testing Library** | Testes por comportamento observável, não por implementação. 13 suítes cobrem serviço de API, reducers do carrinho, persistência e os componentes críticos (lista, card, detalhes, drawer). |
| **Docker multi-stage + `output: 'standalone'`** | O estágio final copia apenas o servidor mínimo e os assets, reduzindo a imagem e o tempo de start. `docker compose up --build` sobe tudo com um comando. |
| **ESLint + Prettier** | `npm run check` roda lint, typecheck, formatação e testes em sequência — mesmo portão usado antes de cada commit. |

## Executando localmente

Requisitos: Node.js 20.9 ou superior e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Com Docker

```bash
docker compose up --build
```

## Scripts

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm start            # serve o build standalone de produção
npm test             # testes
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run format:check # Prettier
npm run check        # todas as verificações
```

## API

O endereço padrão é `https://api-challenge.starsoft.games/api/v1` e pode ser alterado por:

```env
NEXT_PUBLIC_API_BASE_URL=https://api-challenge.starsoft.games/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` define a base absoluta dos metadados, do sitemap e do robots. Em produção
ela aponta para `https://starsoft-frontend-challenge-one.vercel.app`; sem a variável, a aplicação
cai no padrão `http://localhost:3000`.

O Swagger publicado ainda aponta para um aplicativo antigo do Heroku. O serviço converte o contrato
real `{ products, count }`, incluindo o preço recebido como string, para um modelo interno tipado.
A API não oferece um endpoint individual de produto; por isso, a página de detalhes localiza o item
na coleção retornada pela listagem.

## Limitações conhecidas

- O checkout é uma interação demonstrativa: limpa o carrinho e exibe confirmação, mas não envia pedidos.
- A API não expõe `GET /products/:id`; a página de detalhes localiza o item na coleção retornada pela
  listagem, o que obriga a buscar a página inteira para renderizar um único produto.
- Não há busca, filtros nem ordenação, porque a API atual não oferece esses parâmetros.
- As imagens são remotas e o `next/image` está restrito aos hosts declarados em
  `src/lib/config/images.ts`; um host novo na API exige atualizar essa lista.
- Não há autenticação nem carrinho por usuário — a persistência é local ao navegador.
- Não há testes end-to-end; a cobertura é de unidade e integração de componentes.
- O enunciado original foi preservado em `docs/challenge/README.original.md`.

## Melhorias futuras

- **Testes E2E** com Playwright cobrindo o fluxo completo de listagem → detalhes → carrinho →
  checkout, rodando no CI junto do `npm run check`.
- **CI/CD** com GitHub Actions executando lint, typecheck, testes e build da imagem Docker a cada PR.
- **Checkout real** com rota de API do Next.js, validação de payload e tratamento de erro de pedido.
- **Busca, filtros e ordenação** assim que a API expuser os parâmetros correspondentes.
- **Cache do carrinho no servidor** (cookie ou sessão) para manter os itens entre dispositivos.
- **Virtualização da lista** com `@tanstack/react-virtual` caso o catálogo cresça a ponto de o
  “Carregar mais” degradar o tempo de renderização.
- **Orçamento de performance** no CI com Lighthouse CI, travando regressões de LCP e CLS.
- **Storybook** para documentar os componentes de UI e servir de base para testes visuais.
- **Observabilidade** com relatório de Web Vitals e captura de erros do lado do cliente.
