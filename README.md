# Starsoft NFT Marketplace

Marketplace responsivo de itens digitais desenvolvido para o desafio front-end da Starsoft. A
aplicação consome a API pública atual, renderiza a primeira página no servidor e mantém um carrinho
de compras persistente no navegador.

## Demonstração

[Assistir ao vídeo de demonstração](https://jam.dev/c/43e93671-9f8a-427e-a016-5c5b1c96cdef)

## Funcionalidades

- Listagem paginada com “Carregar mais” e indicador de progresso
- Página dinâmica de detalhes em `/products/[id]`
- Carrinho lateral com quantidade, remoção, total e finalização simulada
- Persistência do carrinho em `localStorage`
- Estados de carregamento, erro, vazio e produto não encontrado
- Layout responsivo, navegação por teclado e suporte a movimento reduzido
- Metadados, sitemap e robots para SEO

## Tecnologias

- Next.js 16, React 19 e TypeScript
- TanStack React Query para dados remotos
- Redux Toolkit para carrinho e estado do drawer
- SASS Modules e tokens de design
- Framer Motion para transições e microinterações
- Jest e React Testing Library
- Docker e Docker Compose

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

O Swagger publicado ainda aponta para um aplicativo antigo do Heroku. O serviço converte o contrato
real `{ products, count }`, incluindo o preço recebido como string, para um modelo interno tipado.
A API não oferece um endpoint individual de produto; por isso, a página de detalhes localiza o item
na coleção retornada pela listagem.

## Decisões e limitações

- O checkout é uma interação demonstrativa e não envia pedidos.
- As imagens são remotas e restritas no Next.js ao host usado pela API.
- A rota de detalhes consulta a listagem porque `GET /products/:id` não existe atualmente.
- O enunciado original foi preservado em `docs/challenge/README.original.md`.
