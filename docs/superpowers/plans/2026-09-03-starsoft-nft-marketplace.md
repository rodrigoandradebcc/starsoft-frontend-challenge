# Starsoft NFT Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, from an empty repository, a responsive NFT-marketplace frontend (listing with "Carregar mais", product detail route, persistent "Mochila de Compras" cart drawer) that matches the Figma screenshots in `docs/design/` and satisfies every mandatory requirement and every "Diferencial" of the Starsoft front-end challenge, with a mocked API because the real one is offline.

**Architecture:** Next.js App Router with server-side data prefetch (TanStack Query `HydrationBoundary`) feeding client components; a typed `productsService` over `fetch` isolates the HTTP contract, and MSW intercepts that contract in the browser (service worker), on the Next server (`instrumentation.ts`), and in Jest (node server), so components never know the API is mocked. Cart state lives in Redux Toolkit, persisted to `localStorage` after hydration. All visual values come from the design spec and live in a SCSS token layer (`src/styles/_variables.scss`, `_mixins.scss`, CSS custom properties) consumed by `*.module.scss` files, so the final pixel-check against the screenshots (Task 18) touches tokens and module styles only.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Redux Toolkit 2 + react-redux 9, TanStack React Query 5, Framer Motion 13 (`framer-motion` package), SASS Modules (`sass`), MSW 2, Jest 30 + React Testing Library 16 + `jest-fixed-jsdom`, ESLint 9 flat config (`eslint-config-next`) + Prettier 3, Docker + Docker Compose, `sharp` (dev-only script that crops the item artwork out of the design screenshot into `public/images/`), Poppins via `next/font/google`.

**Spec:**

- Challenge statement (Portuguese): `/Users/rodrigoandradebccgmail.com/Dev/Study/starsoft-frontend-challenge/README.md`. Task 1 copies it verbatim to `docs/challenge/README.original.md` because Task 19 replaces the root README.
- Design spec extracted from Figma: `docs/design/DESIGN-SPEC.md`, with reference screenshots `docs/design/01-home-grid.png` (home, 1610×1846), `docs/design/02-design-system.png` (palette, font, button states), `docs/design/03-cart-overlay.png` (cart drawer). **Every visual task must open these files before writing styles.**

## Global Constraints

- Repository root: `/Users/rodrigoandradebccgmail.com/Dev/Study/starsoft-frontend-challenge`. Branch: `main`. The repo starts with only `README.md`, `.git`, and `docs/design/*`.
- Local toolchain (verified): Node `v20.19.6`, npm `11.17.0`, Docker `29.6.1`, Docker Compose `v5.3.0`. Next 16 requires Node `>=20.9.0`.
- Package manager: **npm** only (`package-lock.json` committed).
- Decisions that are FINAL: the challenge API `https://starsoft-challenge-7dfd4a56a575.herokuapp.com/v1` is dead; data comes from **MSW** handlers over a local fixture; styling is **SASS Modules + tokens**; the design is the three screenshots + `DESIGN-SPEC.md`.
- **Design tokens (exact, from `DESIGN-SPEC.md`):** primary `#FF8310`; surface `#232323`; background `#191A20`; surface-alt `#393939`; text-muted `#CCCCCC`; text `#FFFFFF`; font **Poppins** (`next/font/google`, weights 400/500/600); `border-radius: 8px` everywhere except circular buttons (`50%`). Card title 16px/500; description 12px/400 muted; price 16px/600; button labels uppercase 600 with slight letter-spacing; footer 11px uppercase muted.
- **Design layout facts:** sticky header (`#191A20`, 1px subtle bottom border) with orange "starsoft" wordmark left and outlined orange bag icon + white count right; centered container max-width 1350px; 4-column grid on desktop with 24px gap (3 cols ≤1280px, 2 cols ≤1024px, 1 col ≤640px); card `#232323`, padding 20px, square thumbnail on `#191A20`, title → description → price row (ETH diamond icon + `32 ETH`) → full-width orange `COMPRAR`; below the grid a progress bar (track `#393939`, fill `#FF8310`, loaded/total) above a 370px-wide `#393939` `Carregar mais` button that becomes disabled `Você já viu tudo` with a 100% bar at the end; footer `STARSOFT © TODOS OS DIREITOS RESERVADOS` centered.
- **Pagination is "load more" (accumulating)** via `useInfiniteQuery`; the API metadata must expose `total` so the progress bar can compute `loaded / total`.
- **Button states:** buy button `COMPRAR` → `ADICIONADO AO CARRINHO` (both orange, per the home frame — see open question 2); checkout `FINALIZAR COMPRA` → `COMPRA FINALIZADA!` (both orange); load-more `Carregar mais` → `Você já viu tudo` (disabled).
- **Cart** is an overlay drawer titled `Mochila de Compras` with a circular back button (`#393939` circle, `#FF8310` arrow) that closes it; rows are `#232323` with 80px square thumbnail, uppercase title, muted description, ETH price, a bordered `−  1  +` stepper pill, and a circular orange trash button; panel footer shows `TOTAL` left and ETH icon + summed ETH right, then full-width orange `FINALIZAR COMPRA`.
- UI copy is **Portuguese (pt-BR)** exactly as above, plus: `Seu carrinho está vazio`, `Tentar novamente`, `Nenhum produto encontrado`, `Voltar para a loja`, `Produto não encontrado`, `Remover item`, `Diminuir quantidade`, `Aumentar quantidade`, `Abrir carrinho`, `Fechar carrinho`. Code, comments, and commit messages are **English**.
- Prices are integers or decimals in ETH formatted as `32 ETH` / `0.35 ETH` (no trailing zeros, max 3 decimals).
- Every data-fetching surface renders explicit **loading**, **error** (with `Tentar novamente`), and **empty** states.
- Assets are local only: icons are inline SVG React components in `src/components/icons/`; item artwork lives in `public/images/item-01.webp … item-08.webp` (cropped from the design screenshot by `scripts/extract-design-images.mjs`). No external image hosts. The only build-time network use is npm and the Poppins download by `next/font/google` (see risk 6).
- Path alias `@/*` → `src/*`. All source lives under `src/`.
- Tests select elements by **role / accessible name / text**, never by CSS class.
- Env vars: `NEXT_PUBLIC_API_BASE_URL` (default `https://starsoft-challenge-7dfd4a56a575.herokuapp.com/v1`), `NEXT_PUBLIC_API_MOCKING` (`enabled` | `disabled`). Swapping to a real API = set the base URL + `NEXT_PUBLIC_API_MOCKING=disabled`.
- The repo must build and run (`npm run build && npm start`, or `npm run dev`) after **every** task.
- One commit per task minimum (see "Git commit hygiene").

---

## Requirement traceability (README "Avaliação" → tasks)

| Avaliação criterion                                                                           | Where it is satisfied                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uso do Next.js (SSR, rotas dinâmicas, `next/image`, dynamic import, API routes se necessário) | T1 (App Router scaffold), T6 (`instrumentation.ts`), T12 (SSR prefetch + `force-dynamic`), T13 (dynamic route `/products/[id]`, `generateMetadata`), T11 (`next/image`), T14 (`next/dynamic` CartDrawer) |
| Fidelidade ao Design (Figma)                                                                  | T3 (exact tokens + Poppins), T10/T11/T12/T14 (built to the screenshots), T18 (pixel-check)                                                                                                               |
| Funcionalidade                                                                                | T11-T14 (listing, add to cart, load more, detail, drawer add/remove/stepper/total/finalizar)                                                                                                             |
| Gerenciamento de Estado (Redux)                                                               | T8 (store, `cartSlice`, `uiSlice`, persistence, typed hooks)                                                                                                                                             |
| Busca de Dados (React Query + Next data fetching, loading/sucesso/erro)                       | T4 (client), T5 (service + MSW), T7 (query options, provider, hydration), T12, T13                                                                                                                       |
| Animações e Interações (Framer Motion)                                                        | T11 (card/button hover+tap), T14 (drawer slide + item add/remove), T15 (page transitions, badge pulse, reduced motion)                                                                                   |
| Código Limpo (ESLint, Prettier, Clean Code)                                                   | T1 (tooling); every task's verify step runs `npm run lint && npm run typecheck && npm run format:check`                                                                                                  |
| Estilização (SASS modular e reutilizável)                                                     | T3 (tokens/mixins/globals); every component uses `*.module.scss`                                                                                                                                         |
| Testes (Jest + RTL)                                                                           | T2 (harness), T4, T5, T8, T9, T10, T11, T12, T13, T14                                                                                                                                                    |
| Configuração com Docker                                                                       | T17 (multi-stage Dockerfile, `docker-compose.yml`, one command)                                                                                                                                          |
| Documentação (README)                                                                         | T19                                                                                                                                                                                                      |
| Histórico de Commits                                                                          | Git hygiene section + one commit per task                                                                                                                                                                |
| Diferencial: TypeScript                                                                       | strict TS from T1                                                                                                                                                                                        |
| Diferencial: SEO e Acessibilidade, Lighthouse                                                 | T3 (lang, metadata), T13 (`generateMetadata`), T16 (sitemap, robots, OG, skip link, a11y audit, Lighthouse ≥90)                                                                                          |

README item coverage: 1 Next.js → T1/T6/T11-T14; 2 UI/Figma/responsivo/navegação → T3/T10-T14/T18; 3 Redux → T8; 4 React Query + API + estados → T4-T7/T12/T13; 5 Framer Motion → T11/T14/T15; 6 SASS → T3+; 7 Docker → T17; 8 Boas práticas → T1 + verify steps; 9 Testes → T2+; Diferenciais → T1/T16; Entrega README → T19.

---

## Git commit hygiene (graded by the challenge)

- Commit **at the end of every task** (more often when a step is a natural unit). Never start the next task with uncommitted work.
- Conventional Commits, English, imperative, ≤72-char subject; body explains _why_ when non-obvious. Types: `chore`, `feat`, `fix`, `test`, `style`, `docs`, `refactor`, `build`.
- Stage explicitly (`git add <paths>`); never commit `node_modules`, `.next`, `.env*.local`, `lighthouse.json`.
- Never `--no-verify`, never amend a pushed commit, never squash (graders want to see progression).
- Every commit message must end with the attribution trailer configured by the harness for this session (`Co-Authored-By: ...` and `Claude-Session: ...`). Commit examples below show subject/body only; append the trailer verbatim.
- Before the first commit: `git config user.email` must print `rodrigoandradebcc@gmail.com` (else `git config user.name "Rodrigo Andrade" && git config user.email rodrigoandradebcc@gmail.com`).

---

## File structure (final state)

```
.
├── .dockerignore  .editorconfig  .env.development  .env.production  .env.test  .env.example
├── .nvmrc  .prettierrc.json  .prettierignore  eslint.config.mjs  jest.config.ts  jest.setup.ts
├── next.config.ts  tsconfig.json  package.json  Dockerfile  docker-compose.yml  README.md
├── docs/challenge/README.original.md          # verbatim copy of the challenge spec
├── docs/design/DESIGN-SPEC.md + 3 screenshots  # design source of truth (already present)
├── docs/superpowers/plans/2026-09-03-starsoft-nft-marketplace.md
├── scripts/extract-design-images.mjs           # crops 8 item images from 01-home-grid.png (sharp)
├── public/mockServiceWorker.js                 # generated by `npx msw init`
├── public/images/item-01.webp … item-08.webp
└── src/
    ├── instrumentation.ts                      # starts MSW node server for SSR fetches
    ├── app/
    │   ├── layout.tsx  page.tsx  template.tsx  loading.tsx  error.tsx  not-found.tsx
    │   ├── providers.tsx  sitemap.ts  robots.ts
    │   └── products/[id]/page.tsx  loading.tsx  error.tsx
    ├── styles/_variables.scss  _mixins.scss  _reset.scss  globals.scss
    ├── lib/
    │   ├── config/env.ts
    │   ├── api/types.ts  client.ts  products.service.ts  products.service.test.ts
    │   ├── query/queries.ts  getQueryClient.ts
    │   └── format/eth.ts  eth.test.ts
    ├── mocks/handlers.ts  browser.ts  server.ts  enable.ts  fixtures/products.ts
    ├── store/store.ts  hooks.ts  StoreProvider.tsx
    ├── features/
    │   ├── cart/cartSlice.ts  cartSelectors.ts  cartPersistence.ts  useCart.ts
    │   │        cartSlice.test.ts  cartPersistence.test.ts
    │   └── ui/uiSlice.ts
    ├── components/
    │   ├── icons/EthIcon.tsx  BagIcon.tsx  TrashIcon.tsx  ArrowLeftIcon.tsx
    │   ├── ui/Button/  IconButton/  Skeleton/  PriceEth/  ProgressBar/  EmptyState/  ErrorState/
    │   ├── layout/Header/  Footer/  Logo/  SkipLink/
    │   ├── product/ProductCard/  ProductGrid/  ProductList/  LoadMore/  ProductDetails/
    │   └── cart/CartButton/  CartDrawer/  CartItemRow/  QuantityStepper/  CartSummary/
    └── test/renderWithProviders.tsx
```

Each component folder holds `Name.tsx`, `Name.module.scss`, and (where tested) `Name.test.tsx`.

---

## Risks and open questions (read before executing)

1. **MSW on the Next server (SSR) is the riskiest integration.** `src/instrumentation.ts` calls `server.listen()` from `msw/node` when `NEXT_RUNTIME === 'nodejs'`; `next.config.ts` sets `serverExternalPackages: ['msw']` so the Node interceptors are not bundled. Verified in Task 6 with `curl` against the SSR HTML. **Fallback if it cannot be made to work in ≤1 hour:** Route Handlers `src/app/api/v1/products/route.ts` and `src/app/api/v1/products/[id]/route.ts` serving the same fixture through the same pagination logic, with `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1` on the server; browser worker stays. The README explicitly allows API Routes. Service and components are unaffected.
2. **`COMPRAR` colour ambiguity.** `02-design-system.png` shows `COMPRAR` on `#393939` and `ADICIONADO AO CARRINHO` on `#FF8310`; `01-home-grid.png` shows `COMPRAR` orange. Implement per the home frame (orange → orange with text swap) and ask the user to confirm. Switching is a one-line variant change in `ProductCard`.
3. **No product-detail design was provided**, but README item 1 requires dynamic detail routes. Task 13 builds `/products/[id]` reusing the card tokens (two-column: thumbnail left, title/description/price/`COMPRAR` right; single column on mobile). Flag for the user; restyle in Task 18 if they supply a frame.
4. **Build-time prerendering vs. mocked fetch.** Pages that fetch declare `export const dynamic = 'force-dynamic'` so `next build` never calls the mocked API and the app is genuinely SSR. Documented in T19; SSG with `revalidate` is the swap once a real API exists.
5. **`localStorage` hydration flash.** The bag count renders `0` in SSR HTML and updates after mount (avoids hydration mismatch). Accepted; the badge animates the change.
6. **`next/font/google` needs network at build time** (Docker build included). Fallback: download Poppins 400/500/600 `.woff2` into `src/assets/fonts/` and switch `layout.tsx` to `next/font/local` (same `--font-poppins` variable, no other change).
7. **Sass `@use` resolution under Turbopack.** Modules use `@use 'mixins' as *;` relying on `sassOptions.includePaths`. If unresolved, fall back to relative paths (`@use '../../../styles/mixins' as *;`).
8. **Jest + MSW 2 + jsdom** needs `jest-fixed-jsdom`. If `next/jest` + Jest 30 misbehaves, pin `jest@29` + `jest-environment-jsdom@29`.
9. **MSW inside the production Docker image** is unusual but required (no real API). `NEXT_PUBLIC_API_MOCKING=enabled` is a build arg; README lists it as a limitation.
10. **create-next-app refuses non-empty directories** unless files are on its allowlist (`.git`, `docs/` allowed; `README.md` not). Task 1 moves the README aside first.
11. The real API's response envelope is unknown. The mock assumes `{ data: Product[], metadata: { page, limit, total, totalPages, hasNextPage } }` and `Product = { id, name, description, image, price, createdAt }`. Only `types.ts`, `products.service.ts`, `queries.ts`, and `handlers.ts` change if the real shape differs.
12. **Artwork provenance.** The eight item images are cropped from the Figma screenshot (design-provided art); acceptable for a challenge submission and noted in the README.

---

## Tasks

### Task 1: Project scaffolding and tooling

**Files:**

- Create (via create-next-app): `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `next-env.d.ts`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `public/`
- Create: `docs/challenge/README.original.md`, `.nvmrc`, `.editorconfig`, `.prettierrc.json`, `.prettierignore`, `.env.example`, `.env.development`, `.env.production`, `.env.test`
- Modify: `package.json` (scripts), `eslint.config.mjs` (prettier), `next.config.ts`, `README.md` (restore original for now)

**Interfaces:**

- Produces: npm scripts `dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`, `test:watch`, `test:ci`, `check` used by every later verify step.

- [ ] **Step 1: Preserve the challenge spec and move it aside**

```bash
cd /Users/rodrigoandradebccgmail.com/Dev/Study/starsoft-frontend-challenge
mkdir -p docs/challenge && cp README.md docs/challenge/README.original.md
mv README.md /private/tmp/README.challenge.md
git config user.email   # must print rodrigoandradebcc@gmail.com
```

- [ ] **Step 2: Scaffold with create-next-app (non-interactive)**

```bash
cd /Users/rodrigoandradebccgmail.com/Dev/Study/starsoft-frontend-challenge
npx --yes create-next-app@16 . --ts --app --src-dir --eslint --no-tailwind --no-react-compiler --import-alias "@/*" --use-npm --disable-git --skip-install
npm install
mv /private/tmp/README.challenge.md README.md   # overwrite the generated README with the original spec until Task 19
```

Expected: `src/app/layout.tsx`, `src/app/page.tsx`, `eslint.config.mjs`, `next.config.ts`, `tsconfig.json` exist; `npm run dev` starts on :3000.

- [ ] **Step 3: Install and configure Prettier + ESLint integration**

```bash
npm install -D prettier@3 eslint-config-prettier@10
```

Create `.prettierrc.json`:

```json
{ "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2 }
```

Create `.prettierignore`:

```
.next
node_modules
public/mockServiceWorker.js
package-lock.json
```

Replace `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/mockServiceWorker.js']),
]);
```

- [ ] **Step 4: Scripts, Node pin, editor config, env files**

In `package.json` set `"scripts"` to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:ci": "jest --ci --coverage",
  "check": "npm run lint && npm run typecheck && npm run format:check && npm run test"
}
```

Add `"engines": { "node": ">=20.9.0" }`. Create `.nvmrc` containing `20`. Create `.editorconfig`:

```
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

Create `.env.example`:

```
# Base URL of the products API (the challenge API is offline; MSW mocks this URL)
NEXT_PUBLIC_API_BASE_URL=https://starsoft-challenge-7dfd4a56a575.herokuapp.com/v1
# enabled | disabled — when enabled, MSW intercepts requests in browser, server and tests
NEXT_PUBLIC_API_MOCKING=enabled
```

Create `.env.development` and `.env.production`, each containing exactly `NEXT_PUBLIC_API_MOCKING=enabled`. Create `.env.test` containing `NEXT_PUBLIC_API_MOCKING=disabled` (Jest starts its own MSW server in `jest.setup.ts`). These three files contain no secrets and are committed; ensure `.gitignore` keeps `.env*.local` ignored (default from create-next-app) but does not ignore `.env.development`/`.env.production`/`.env.test` — edit `.gitignore` so the env section reads:

```
.env*.local
.env
```

- [ ] **Step 5: `next.config.ts` baseline**

```ts
import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['msw'],
  sassOptions: { includePaths: [path.join(process.cwd(), 'src/styles')] },
};

export default nextConfig;
```

- [ ] **Step 6: Replace the boilerplate page with a minimal placeholder**

`src/app/page.tsx`:

```tsx
export default function HomePage() {
  return <main>Starsoft NFT Marketplace</main>;
}
```

Delete `src/app/page.module.css` and `src/app/globals.css` references from `layout.tsx` (Task 3 adds SCSS globals). `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Starsoft NFT Marketplace',
  description: 'Marketplace de NFTs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

Remove unused boilerplate assets from `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) and `src/app/favicon.ico` stays.

- [ ] **Step 7: Verify**

```bash
npm run format && npm run lint && npm run typecheck && npm run build
```

Expected: all succeed; `npm run build` prints route `/` as dynamic/static without errors. `npm run dev` then `curl -s localhost:3000 | grep -c "Starsoft NFT Marketplace"` → `1`.

- [ ] **Step 8: Commit**

```bash
git add -A -- . ':!README.md' && git add README.md
git commit -m "chore: scaffold Next.js 16 app with TypeScript, ESLint and Prettier

Bootstrap with create-next-app (App Router, src dir, no Tailwind) and add
Prettier, npm scripts, Node pin and env templates. The original challenge
statement is preserved in docs/challenge/README.original.md."
```

---

### Task 2: Jest + React Testing Library harness

**Files:**

- Create: `jest.config.ts`, `jest.setup.ts`, `src/test/renderWithProviders.tsx` (provider-less first version), `src/app/page.test.tsx`
- Modify: `tsconfig.json` (add `"types": ["jest", "@testing-library/jest-dom"]`), `eslint.config.mjs` (jest globals)

**Interfaces:**

- Produces: `renderWithProviders(ui, options?)` (extended in Task 8 with Redux/Query providers); global `IntersectionObserver` and `matchMedia` mocks for jsdom.

- [ ] **Step 1: Install**

```bash
npm install -D jest@30 jest-environment-jsdom@30 jest-fixed-jsdom @testing-library/react@16 @testing-library/jest-dom@7 @testing-library/user-event@14 @types/jest@30 ts-node
```

- [ ] **Step 2: Config**

`jest.config.ts`:

```ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/mocks/**', '!src/test/**'],
  coverageProvider: 'v8',
};

export default createJestConfig(config);
```

`jest.setup.ts`:

```ts
import '@testing-library/jest-dom';

class IntersectionObserverMock {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

`src/test/renderWithProviders.tsx` (v1, no providers yet):

```tsx
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, options);
}
```

In `tsconfig.json` `compilerOptions`, add `"types": ["jest", "@testing-library/jest-dom", "node"]` and ensure `"strict": true`. In `eslint.config.mjs` add before `prettier`: `{ files: ['**/*.test.{ts,tsx}', 'jest.setup.ts'], languageOptions: { globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeAll: 'readonly', afterAll: 'readonly', beforeEach: 'readonly', afterEach: 'readonly' } } }`.

- [ ] **Step 3: Write the smoke test**

`src/app/page.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the marketplace heading text', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Starsoft NFT Marketplace')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: `1 passed`. If `next/jest` fails to load under Jest 30, apply risk 8 fallback (`npm i -D jest@29 jest-environment-jsdom@29 @types/jest@29`).

- [ ] **Step 5: Verify lint/format and commit**

```bash
npm run lint && npm run typecheck && npm run format:check
git add jest.config.ts jest.setup.ts src/test src/app/page.test.tsx tsconfig.json eslint.config.mjs package.json package-lock.json
git commit -m "test: add Jest and React Testing Library harness

Use next/jest with jest-fixed-jsdom so MSW v2 can run in jsdom later, add
IntersectionObserver/matchMedia shims and a renderWithProviders helper."
```

---

### Task 3: Design tokens, global styles, Poppins, root layout shell

**Files:**

- Create: `src/styles/_variables.scss`, `src/styles/_mixins.scss`, `src/styles/_reset.scss`, `src/styles/globals.scss`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**

- Produces: CSS custom properties `--color-primary`, `--color-surface`, `--color-background`, `--color-surface-alt`, `--color-text`, `--color-text-muted`, `--color-border`, `--radius`, `--space-1..--space-8`, `--font-sans`, `--fs-xs/sm/md/lg/xl`, `--container-max`, `--shadow-focus`; SCSS breakpoints `$bp-sm: 640px`, `$bp-md: 1024px`, `$bp-lg: 1280px`; mixins `up($bp)`, `down($bp)`, `visually-hidden`, `focus-ring`, `label-uppercase`, `container`.

- [ ] **Step 1: Install sass**

```bash
npm install -D sass@1
```

- [ ] **Step 2: Tokens (values are the design spec, verbatim)**

`src/styles/_variables.scss`:

```scss
// Breakpoints (SCSS-only: media queries cannot read CSS custom properties)
$bp-sm: 640px; // 1 -> 2 columns
$bp-md: 1024px; // 2 -> 3 columns
$bp-lg: 1280px; // 3 -> 4 columns

// Design tokens from docs/design/DESIGN-SPEC.md
$color-primary: #ff8310;
$color-surface: #232323;
$color-background: #191a20;
$color-surface-alt: #393939;
$color-text-muted: #cccccc;
$color-text: #ffffff;
$radius: 8px;
$container-max: 1350px;
```

`src/styles/_mixins.scss`:

```scss
@use 'variables' as *;

@mixin up($bp) {
  @media (min-width: $bp) {
    @content;
  }
}
@mixin down($bp) {
  @media (max-width: ($bp - 0.02px)) {
    @content;
  }
}

@mixin container {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@mixin focus-ring {
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

@mixin label-uppercase {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
}
```

`src/styles/_reset.scss`:

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  -webkit-text-size-adjust: 100%;
}
body,
h1,
h2,
h3,
p,
ul,
figure {
  margin: 0;
}
ul {
  padding: 0;
  list-style: none;
}
img,
svg {
  display: block;
  max-width: 100%;
}
button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}
a {
  color: inherit;
  text-decoration: none;
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

`src/styles/globals.scss`:

```scss
@use 'variables' as *;
@use 'reset';

:root {
  --color-primary: #{$color-primary};
  --color-surface: #{$color-surface};
  --color-background: #{$color-background};
  --color-surface-alt: #{$color-surface-alt};
  --color-text: #{$color-text};
  --color-text-muted: #{$color-text-muted};
  --color-border: rgba(255, 255, 255, 0.08);
  --radius: #{$radius};
  --container-max: #{$container-max};
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 48px;
  --fs-xs: 0.6875rem;
  --fs-sm: 0.75rem;
  --fs-md: 1rem;
  --fs-lg: 1.25rem;
  --fs-xl: 1.5rem;
  --font-sans: var(--font-poppins), 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color-scheme: dark;
}

html,
body {
  min-height: 100%;
}
body {
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-background);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 3: Root layout with Poppins and metadata**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/styles/globals.scss';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Starsoft NFT Marketplace', template: '%s | Starsoft' },
  description: 'Marketplace de NFTs com carrinho de compras.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
```

If the Poppins download fails (offline), apply risk 6: `next/font/local` with `src/assets/fonts/Poppins-{Regular,Medium,SemiBold}.woff2`, same `variable`.

- [ ] **Step 4: Verify**

```bash
npm run dev &  sleep 6; curl -s localhost:3000 | grep -o 'lang="pt-BR"' ; kill %1
npm run lint && npm run typecheck && npm run format:check && npm test
```

Expected: `lang="pt-BR"` printed; the page shows dark `#191A20` background with white Poppins text in a browser; tests still pass (1).

- [ ] **Step 5: Commit**

```bash
git add src/styles src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add SCSS design tokens, global styles and Poppins font

Encode the Figma palette, radius, spacing and breakpoints as SCSS variables
and CSS custom properties so every component reads visual values from one place."
```

---

### Task 4: API contract types, env config, HTTP client, ETH formatter

**Files:**

- Create: `src/lib/config/env.ts`, `src/lib/api/types.ts`, `src/lib/api/client.ts`, `src/lib/format/eth.ts`, `src/lib/format/eth.test.ts`, `src/lib/api/client.test.ts`

**Interfaces:**

- Produces: `env.apiBaseUrl: string`, `env.apiMocking: boolean`; `Product`, `PaginationMetadata`, `PaginatedResponse<T>`, `ListProductsParams`, `DEFAULT_PAGE_SIZE = 8`; `class ApiError extends Error { status: number }`; `apiFetch<T>(path: string, init?: RequestInit): Promise<T>`; `formatEth(value: number): string`.
- Consumes: nothing yet (Task 5 adds `enableMocking()` to `apiFetch`).

- [ ] **Step 1: Types and env**

`src/lib/config/env.ts`:

```ts
const DEFAULT_API_BASE_URL = 'https://starsoft-challenge-7dfd4a56a575.herokuapp.com/v1';

/** Runtime configuration. NEXT_PUBLIC_* values are inlined at build time for the browser. */
export const env = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, ''),
  apiMocking: process.env.NEXT_PUBLIC_API_MOCKING === 'enabled',
} as const;
```

`src/lib/api/types.ts`:

```ts
export interface Product {
  id: string;
  name: string;
  description: string;
  /** Path under /public, e.g. "/images/item-01.webp" */
  image: string;
  /** Price in ETH */
  price: number;
  createdAt: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
}

export const DEFAULT_PAGE_SIZE = 8;
```

- [ ] **Step 2: Failing tests for formatter and client**

`src/lib/format/eth.test.ts`:

```ts
import { formatEth } from './eth';

describe('formatEth', () => {
  it('formats integers without decimals', () => expect(formatEth(32)).toBe('32 ETH'));
  it('trims trailing zeros up to 3 decimals', () => {
    expect(formatEth(0.35)).toBe('0.35 ETH');
    expect(formatEth(1.2)).toBe('1.2 ETH');
    expect(formatEth(0.1234)).toBe('0.123 ETH');
  });
  it('handles zero', () => expect(formatEth(0)).toBe('0 ETH'));
});
```

`src/lib/api/client.test.ts`:

```ts
import { ApiError, apiFetch } from './client';

describe('apiFetch', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns parsed JSON on success', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(apiFetch<{ ok: boolean }>('/ping')).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/v1\/ping$/),
      expect.any(Object),
    );
  });

  it('throws ApiError with status and server message on failure', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: 'Product not found' }), { status: 404 }),
      );
    await expect(apiFetch('/products/x')).rejects.toMatchObject<Partial<ApiError>>({
      status: 404,
      message: 'Product not found',
    });
  });
});
```

Run: `npm test -- src/lib` → Expected: FAIL (`Cannot find module './eth'` / `'./client'`).

- [ ] **Step 3: Implement**

`src/lib/format/eth.ts`:

```ts
const ethFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

/** Formats an ETH amount for display: 32 -> "32 ETH", 0.35 -> "0.35 ETH". */
export function formatEth(value: number): string {
  return `${ethFormatter.format(value)} ETH`;
}
```

`src/lib/api/client.ts`:

```ts
import { env } from '@/lib/config/env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thin typed fetch wrapper. All HTTP goes through here, so MSW (or a real API) is transparent to callers. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    let message = response.statusText || `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // non-JSON error body; keep the status text
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
```

- [ ] **Step 4: Run tests, verify, commit**

Run: `npm test -- src/lib` → Expected: 5 passed. Then `npm run lint && npm run typecheck && npm run format:check`.

```bash
git add src/lib
git commit -m "feat: add typed API client, product contract types and ETH formatter"
```

---

### Task 5: Fixture, local artwork, MSW handlers + node server, products service (TDD)

**Files:**

- Create: `scripts/extract-design-images.mjs`, `public/images/item-01.webp … item-08.webp`, `src/mocks/fixtures/products.ts`, `src/mocks/handlers.ts`, `src/mocks/server.ts`, `src/lib/api/products.service.ts`, `src/lib/api/products.service.test.ts`
- Modify: `jest.setup.ts` (MSW lifecycle), `package.json` (`images:extract` script)

**Interfaces:**

- Produces: `products: Product[]` (16 items, each `image` one of the 8 files, cycling); `handlers: RequestHandler[]`; `server = setupServer(...handlers)`; `productsService.list(params?: ListProductsParams): Promise<PaginatedResponse<Product>>`; `productsService.getById(id: string): Promise<Product>`.
- Consumes: `apiFetch`, `ApiError`, types from Task 4.

- [ ] **Step 1: Install**

```bash
npm install -D msw@2 sharp@0.35
```

- [ ] **Step 2: Extract the eight item images from the design screenshot**

`scripts/extract-design-images.mjs` (the screenshot is 1610×1846; thumbnail boxes measured from it):

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SOURCE = 'docs/design/01-home-grid.png';
const OUT_DIR = 'public/images';
const SIZE = 512;
const BG = { r: 0x19, g: 0x1a, b: 0x20, alpha: 1 }; // #191A20, same as the card thumbnail background
const columns = [160, 503, 845, 1187]; // left edge of each thumbnail box
const rows = [302, 840]; // top edge of each thumbnail row
const BOX = { width: 266, height: 232 };

await mkdir(OUT_DIR, { recursive: true });
let index = 1;
for (const top of rows) {
  for (const left of columns) {
    const file = `${OUT_DIR}/item-${String(index).padStart(2, '0')}.webp`;
    await sharp(SOURCE)
      .extract({ left, top, ...BOX })
      .resize(SIZE, SIZE, { fit: 'contain', background: BG })
      .webp({ quality: 88 })
      .toFile(file);
    console.log('wrote', file);
    index += 1;
  }
}
```

Add script `"images:extract": "node scripts/extract-design-images.mjs"` and run `npm run images:extract`. Open two of the outputs (Read tool) and confirm each shows one full item (staff, skull lantern, potion, spellbook, orb, armor, feather, mace) on a dark background with no neighbouring card edges; nudge the coordinates by a few px if a border is visible.

- [ ] **Step 3: Fixture**

`src/mocks/fixtures/products.ts`:

```ts
import type { Product } from '@/lib/api/types';

const catalog: Array<Pick<Product, 'name' | 'description' | 'price'>> = [
  {
    name: 'Cajado Estelar',
    description: 'Cajado de cristal forjado sob a luz de uma estrela cadente.',
    price: 32,
  },
  {
    name: 'Lanterna Espectral',
    description: 'Lanterna de crânio que arde com fogo azul eterno.',
    price: 12,
  },
  {
    name: 'Poção de Vitalidade',
    description: 'Elixir esmeralda que restaura toda a energia vital.',
    price: 32,
  },
  {
    name: 'Grimório Verdejante',
    description: 'Livro antigo protegido por um selo de folhas vivas.',
    price: 32,
  },
  { name: 'Orbe Cósmico', description: 'Esfera que contém uma galáxia em miniatura.', price: 32 },
  {
    name: 'Armadura Glacial',
    description: 'Peitoral de aço azul temperado no gelo eterno.',
    price: 32,
  },
  { name: 'Pena Dourada', description: 'Pena de fênix que nunca perde o brilho.', price: 32 },
  { name: 'Maça Solar', description: 'Maça cravejada que canaliza a energia do sol.', price: 32 },
  {
    name: 'Cajado do Crepúsculo',
    description: 'Variante sombria do cajado estelar, forjada ao anoitecer.',
    price: 28,
  },
  {
    name: 'Lanterna do Abismo',
    description: 'Ilumina caminhos que não deveriam ser encontrados.',
    price: 15,
  },
  {
    name: 'Poção de Sombras',
    description: 'Concede invisibilidade por um breve instante.',
    price: 18.5,
  },
  {
    name: 'Grimório Carmesim',
    description: 'Feitiços proibidos escritos em tinta vermelha.',
    price: 40,
  },
  { name: 'Orbe de Tempestade', description: 'Relâmpagos presos em vidro encantado.', price: 36 },
  {
    name: 'Armadura Rúnica',
    description: 'Runas antigas gravadas em cada placa de aço.',
    price: 45,
  },
  { name: 'Pena do Vento', description: 'Leve como uma brisa, rápida como um furacão.', price: 22 },
  { name: 'Maça Lunar', description: 'Brilha com a luz prateada da lua cheia.', price: 30.25 },
];

const IMAGE_COUNT = 8;

/** 16 products so the listing needs exactly two "Carregar mais" pages at DEFAULT_PAGE_SIZE = 8. */
export const products: Product[] = catalog.map((item, index) => ({
  id: String(index + 1),
  ...item,
  image: `/images/item-${String((index % IMAGE_COUNT) + 1).padStart(2, '0')}.webp`,
  createdAt: new Date(Date.UTC(2025, 0, 1 + index)).toISOString(),
}));
```

- [ ] **Step 4: Handlers and node server**

`src/mocks/handlers.ts`:

```ts
import { delay, http, HttpResponse } from 'msw';
import { env } from '@/lib/config/env';
import { DEFAULT_PAGE_SIZE, type PaginatedResponse, type Product } from '@/lib/api/types';
import { products } from './fixtures/products';

const MAX_PAGE_SIZE = 50;
const SIMULATED_LATENCY_MS = 500;

function toInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function simulateLatency() {
  if (process.env.NODE_ENV !== 'test') await delay(SIMULATED_LATENCY_MS);
}

export const handlers = [
  http.get(`${env.apiBaseUrl}/products`, async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, toInt(url.searchParams.get('page'), 1));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, toInt(url.searchParams.get('limit'), DEFAULT_PAGE_SIZE)),
    );
    const start = (page - 1) * limit;
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    await simulateLatency();
    const body: PaginatedResponse<Product> = {
      data: products.slice(start, start + limit),
      metadata: { page, limit, total, totalPages, hasNextPage: page < totalPages },
    };
    return HttpResponse.json(body);
  }),

  http.get(`${env.apiBaseUrl}/products/:id`, async ({ params }) => {
    await simulateLatency();
    const product = products.find((item) => item.id === params.id);
    if (!product) return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    return HttpResponse.json(product);
  }),
];
```

`src/mocks/server.ts`:

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

Append to `jest.setup.ts`:

```ts
import { server } from '@/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

(Existing `client.test.ts` replaces `global.fetch` itself, so it is unaffected.)

- [ ] **Step 5: Failing service tests**

`src/lib/api/products.service.test.ts`:

```ts
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { env } from '@/lib/config/env';
import { ApiError } from './client';
import { productsService } from './products.service';

describe('productsService', () => {
  it('lists the first page with pagination metadata', async () => {
    const result = await productsService.list({ page: 1, limit: 8 });
    expect(result.data).toHaveLength(8);
    expect(result.data[0]).toMatchObject({
      id: '1',
      name: 'Cajado Estelar',
      price: 32,
      image: '/images/item-01.webp',
    });
    expect(result.metadata).toEqual({
      page: 1,
      limit: 8,
      total: 16,
      totalPages: 2,
      hasNextPage: true,
    });
  });

  it('marks the last page', async () => {
    const result = await productsService.list({ page: 2, limit: 8 });
    expect(result.data.map((p) => p.id)).toEqual(['9', '10', '11', '12', '13', '14', '15', '16']);
    expect(result.metadata.hasNextPage).toBe(false);
  });

  it('returns an empty page beyond the end', async () => {
    const result = await productsService.list({ page: 99 });
    expect(result.data).toEqual([]);
  });

  it('gets a product by id', async () => {
    await expect(productsService.getById('2')).resolves.toMatchObject({
      id: '2',
      name: 'Lanterna Espectral',
      price: 12,
    });
  });

  it('throws ApiError 404 for an unknown id', async () => {
    await expect(productsService.getById('nope')).rejects.toBeInstanceOf(ApiError);
    await expect(productsService.getById('nope')).rejects.toMatchObject({ status: 404 });
  });

  it('surfaces server errors', async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/products`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    await expect(productsService.list()).rejects.toMatchObject({ status: 500, message: 'boom' });
  });
});
```

Run: `npm test -- products.service` → Expected: FAIL (`Cannot find module './products.service'`).

- [ ] **Step 6: Implement the service**

`src/lib/api/products.service.ts`:

```ts
import { apiFetch } from './client';
import {
  DEFAULT_PAGE_SIZE,
  type ListProductsParams,
  type PaginatedResponse,
  type Product,
} from './types';

/** All product endpoints. Components and hooks call these, never fetch directly. */
export const productsService = {
  list({ page = 1, limit = DEFAULT_PAGE_SIZE }: ListProductsParams = {}): Promise<
    PaginatedResponse<Product>
  > {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch<PaginatedResponse<Product>>(`/products?${query.toString()}`);
  },
  getById(id: string): Promise<Product> {
    return apiFetch<Product>(`/products/${encodeURIComponent(id)}`);
  },
};
```

- [ ] **Step 7: Run tests, verify, commit**

Run: `npm test` → Expected: all pass (≥12). `npm run lint && npm run typecheck && npm run format:check`.

```bash
git add scripts public/images src/mocks src/lib/api jest.setup.ts package.json package-lock.json
git commit -m "feat: add MSW handlers, product fixture and products service

The challenge API is offline, so MSW models /v1/products (paginated) and
/v1/products/:id over a local fixture. Item artwork is cropped from the
design screenshot into public/images so the app works offline."
```

---

### Task 6: MSW in the browser and on the Next server (SSR)

**Files:**

- Create: `src/mocks/browser.ts`, `src/mocks/enable.ts`, `src/instrumentation.ts`, `public/mockServiceWorker.js` (generated)
- Modify: `src/lib/api/client.ts` (await `enableMocking()`), `src/app/page.tsx` (temporary SSR probe), `package.json` (`msw.workerDirectory`)

**Interfaces:**

- Produces: `enableMocking(): Promise<void>` (idempotent; browser starts the worker once, server resolves immediately, tests resolve immediately).

- [ ] **Step 1: Generate the worker script**

```bash
npx msw init ./public --save
```

Expected: `public/mockServiceWorker.js` exists and `package.json` has `"msw": { "workerDirectory": ["public"] }`.

- [ ] **Step 2: Browser worker and the idempotent enabler**

`src/mocks/browser.ts`:

```ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

`src/mocks/enable.ts`:

```ts
import { env } from '@/lib/config/env';

let browserMockingReady: Promise<void> | undefined;

/**
 * Ensures MSW is intercepting before the first request.
 * - Browser: lazily loads and starts the service worker once.
 * - Server: instrumentation.ts already started msw/node, nothing to do.
 * - Tests: jest.setup.ts owns the server lifecycle, nothing to do.
 */
export function enableMocking(): Promise<void> {
  if (!env.apiMocking || typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  if (!browserMockingReady) {
    browserMockingReady = import('./browser').then(({ worker }) =>
      worker
        .start({ onUnhandledRequest: 'bypass', quiet: process.env.NODE_ENV === 'production' })
        .then(() => undefined),
    );
  }
  return browserMockingReady;
}
```

In `src/lib/api/client.ts` add `import { enableMocking } from '@/mocks/enable';` and, as the first line of `apiFetch`, `await enableMocking();`.

- [ ] **Step 3: Server instrumentation**

`src/instrumentation.ts`:

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    const { server } = await import('./mocks/server');
    server.listen({ onUnhandledRequest: 'bypass' });
    console.info('[msw] server-side mocking enabled');
  }
}
```

- [ ] **Step 4: Temporary SSR probe page**

`src/app/page.tsx` (replaced in Task 12):

```tsx
import { productsService } from '@/lib/api/products.service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { metadata } = await productsService.list({ page: 1 });
  return <main>Starsoft NFT Marketplace — {metadata.total} produtos</main>;
}
```

Update `src/app/page.test.tsx` to remove the old smoke test (delete the file; Task 12 adds real tests).

- [ ] **Step 5: Verify SSR and browser interception**

```bash
npm run dev & sleep 8
curl -s localhost:3000 | grep -o "16 produtos"
kill %1
```

Expected: `16 produtos` (proves the server-side fetch was answered by MSW). Then in a browser open `http://localhost:3000`, DevTools console shows `[MSW] Mocking enabled.` after any client fetch (none yet; acceptable) and no errors. Also `npm run build && npm start` → same curl result (proves instrumentation works in the standalone/production server). If SSR fails after ≤1h of debugging, apply risk 1 fallback (Route Handlers) and record the decision in the commit body.

- [ ] **Step 6: Lint, test, commit**

```bash
npm run lint && npm run typecheck && npm run format:check && npm test
git add src/mocks src/instrumentation.ts src/lib/api/client.ts src/app/page.tsx public/mockServiceWorker.js package.json
git rm -q src/app/page.test.tsx
git commit -m "feat: enable MSW in browser, Next server and tests

instrumentation.ts starts the msw/node server so server components can
fetch the mocked API during SSR; the browser lazily starts the service
worker before the first request."
```

---

### Task 7: TanStack Query setup, query options, SSR hydration wiring

**Files:**

- Create: `src/lib/query/getQueryClient.ts`, `src/lib/query/queries.ts`, `src/lib/query/queries.test.ts`, `src/app/providers.tsx`
- Modify: `src/app/layout.tsx` (wrap with `Providers`), `src/app/page.tsx` (prefetch + hydrate probe)

**Interfaces:**

- Produces: `getQueryClient(): QueryClient` (new per server request, singleton in browser); `productKeys.all/list(limit)/detail(id)`; `productsInfiniteQueryOptions(limit = DEFAULT_PAGE_SIZE)`; `productQueryOptions(id)`; `<Providers>` client component (extended in Task 8 with Redux and Task 15 with `MotionConfig`).

- [ ] **Step 1: Install**

```bash
npm install @tanstack/react-query@5
npm install -D @tanstack/eslint-plugin-query@5
```

Add to `eslint.config.mjs` (before `prettier`): `import pluginQuery from '@tanstack/eslint-plugin-query';` and `...pluginQuery.configs['flat/recommended'],`.

- [ ] **Step 2: Failing query-options test**

`src/lib/query/queries.test.ts`:

```ts
import { productKeys, productQueryOptions, productsInfiniteQueryOptions } from './queries';

describe('query options', () => {
  it('builds stable, hierarchical keys', () => {
    expect(productKeys.all).toEqual(['products']);
    expect(productKeys.list(8)).toEqual(['products', 'list', { limit: 8 }]);
    expect(productKeys.detail('3')).toEqual(['products', 'detail', '3']);
    expect(productQueryOptions('3').queryKey).toEqual(productKeys.detail('3'));
  });

  it('computes the next page from metadata', () => {
    const { getNextPageParam, initialPageParam } = productsInfiniteQueryOptions(8);
    const meta = { limit: 8, total: 16, totalPages: 2 };
    expect(initialPageParam).toBe(1);
    expect(
      getNextPageParam({ data: [], metadata: { ...meta, page: 1, hasNextPage: true } }, [], 1, []),
    ).toBe(2);
    expect(
      getNextPageParam({ data: [], metadata: { ...meta, page: 2, hasNextPage: false } }, [], 2, []),
    ).toBeUndefined();
  });
});
```

Run: `npm test -- queries` → Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`src/lib/query/queries.ts`:

```ts
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { productsService } from '@/lib/api/products.service';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/types';

export const productKeys = {
  all: ['products'] as const,
  list: (limit: number) => [...productKeys.all, 'list', { limit }] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export const productsInfiniteQueryOptions = (limit: number = DEFAULT_PAGE_SIZE) =>
  infiniteQueryOptions({
    queryKey: productKeys.list(limit),
    queryFn: ({ pageParam }) => productsService.list({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.metadata.hasNextPage ? lastPage.metadata.page + 1 : undefined,
  });

export const productQueryOptions = (id: string) =>
  queryOptions({ queryKey: productKeys.detail(id), queryFn: () => productsService.getById(id) });
```

`src/lib/query/getQueryClient.ts`:

```ts
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** Server: a fresh client per request (no cross-user cache). Browser: one client for the app lifetime. */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
```

`src/app/providers.tsx`:

```tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getQueryClient } from '@/lib/query/getQueryClient';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

In `layout.tsx` wrap: `<body><Providers>{children}</Providers></body>`.

- [ ] **Step 4: Hydration probe on the home page (replaced in Task 12)**

`src/app/page.tsx`:

```tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/getQueryClient';
import { productsInfiniteQueryOptions } from '@/lib/query/queries';
import { ProductsProbe } from './ProductsProbe';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(productsInfiniteQueryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsProbe />
    </HydrationBoundary>
  );
}
```

`src/app/ProductsProbe.tsx` (temporary, deleted in Task 12):

```tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { productsInfiniteQueryOptions } from '@/lib/query/queries';

export function ProductsProbe() {
  const { data, status } = useInfiniteQuery(productsInfiniteQueryOptions());
  if (status !== 'success') return <main>{status}</main>;
  return <main>Starsoft NFT Marketplace — {data.pages[0].metadata.total} produtos</main>;
}
```

- [ ] **Step 5: Verify**

`npm test` → all pass. `npm run dev`, `curl -s localhost:3000 | grep -o "16 produtos"` → printed (data is in the SSR HTML, proving prefetch + hydration). In the browser Network tab, no `/products` request fires on first load (hydrated cache). `npm run lint && npm run typecheck && npm run format:check`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/query src/app/providers.tsx src/app/layout.tsx src/app/page.tsx src/app/ProductsProbe.tsx eslint.config.mjs package.json package-lock.json
git commit -m "feat: add TanStack Query client, product query options and SSR hydration"
```

---

### Task 8: Redux Toolkit store, cart slice, persistence, typed hooks (TDD)

**Files:**

- Create: `src/store/store.ts`, `src/store/hooks.ts`, `src/store/StoreProvider.tsx`, `src/features/cart/cartSlice.ts`, `src/features/cart/cartSelectors.ts`, `src/features/cart/cartPersistence.ts`, `src/features/cart/useCart.ts`, `src/features/ui/uiSlice.ts`, `src/features/cart/cartSlice.test.ts`, `src/features/cart/cartPersistence.test.ts`
- Modify: `src/app/providers.tsx`, `src/test/renderWithProviders.tsx`

**Interfaces:**

- Produces:
  - `CartItem { id; name; description; image; price; quantity }`, `CartState { items: CartItem[]; checkoutCompleted: boolean }`
  - actions `addItem(product: Product)`, `removeItem(id)`, `incrementItem(id)`, `decrementItem(id)` (removes at 0), `setQuantity({ id, quantity })`, `clearCart()`, `hydrateCart(CartState)`, `completeCheckout()`, `resetCheckout()`
  - selectors `selectCartItems`, `selectCartCount` (sum of quantities), `selectCartTotal` (ETH), `selectCartItemById(id)`, `selectIsInCart(id)`, `selectCheckoutCompleted`
  - `uiSlice`: `selectIsCartOpen`, `openCart()`, `closeCart()`, `toggleCart()`
  - `makeStore(preloadedState?: Partial<RootState>)`, `AppStore`, `RootState`, `AppDispatch`, `useAppDispatch`, `useAppSelector`
  - `useCart()` hook returning `{ items, count, total, isOpen, add, remove, increment, decrement, open, close, toggle, checkoutCompleted, finishCheckout }`
  - `renderWithProviders(ui, { preloadedState?, store?, queryClient? })` returning `{ store, queryClient, ...renderResult }`
  - `CART_STORAGE_KEY = 'starsoft-cart:v1'`

- [ ] **Step 1: Install**

```bash
npm install @reduxjs/toolkit@2 react-redux@9
```

- [ ] **Step 2: Failing reducer/selector tests**

`src/features/cart/cartSlice.test.ts`:

```ts
import type { Product } from '@/lib/api/types';
import { makeStore } from '@/store/store';
import {
  addItem,
  clearCart,
  completeCheckout,
  decrementItem,
  hydrateCart,
  incrementItem,
  removeItem,
  setQuantity,
} from './cartSlice';
import {
  selectCartCount,
  selectCartItems,
  selectCartTotal,
  selectCheckoutCompleted,
  selectIsInCart,
} from './cartSelectors';

const staff: Product = {
  id: '1',
  name: 'Cajado Estelar',
  description: 'd',
  image: '/images/item-01.webp',
  price: 32,
  createdAt: '2025-01-01T00:00:00.000Z',
};
const lantern: Product = { ...staff, id: '2', name: 'Lanterna Espectral', price: 12.5 };

describe('cartSlice', () => {
  it('starts empty', () => {
    const store = makeStore();
    expect(selectCartItems(store.getState())).toEqual([]);
    expect(selectCartCount(store.getState())).toBe(0);
    expect(selectCartTotal(store.getState())).toBe(0);
  });

  it('adds a product as a cart item with quantity 1 and increments on repeat', () => {
    const store = makeStore();
    store.dispatch(addItem(staff));
    store.dispatch(addItem(staff));
    expect(selectCartItems(store.getState())).toEqual([
      {
        id: '1',
        name: 'Cajado Estelar',
        description: 'd',
        image: '/images/item-01.webp',
        price: 32,
        quantity: 2,
      },
    ]);
    expect(selectIsInCart('1')(store.getState())).toBe(true);
  });

  it('computes count and total across items', () => {
    const store = makeStore();
    store.dispatch(addItem(staff));
    store.dispatch(addItem(lantern));
    store.dispatch(incrementItem('2'));
    expect(selectCartCount(store.getState())).toBe(3);
    expect(selectCartTotal(store.getState())).toBe(57);
  });

  it('decrements to zero removes the item', () => {
    const store = makeStore();
    store.dispatch(addItem(staff));
    store.dispatch(decrementItem('1'));
    expect(selectCartItems(store.getState())).toEqual([]);
  });

  it('setQuantity clamps at 1 and removes on 0', () => {
    const store = makeStore();
    store.dispatch(addItem(staff));
    store.dispatch(setQuantity({ id: '1', quantity: 5 }));
    expect(selectCartCount(store.getState())).toBe(5);
    store.dispatch(setQuantity({ id: '1', quantity: 0 }));
    expect(selectCartItems(store.getState())).toEqual([]);
  });

  it('removes, clears and hydrates', () => {
    const store = makeStore();
    store.dispatch(addItem(staff));
    store.dispatch(addItem(lantern));
    store.dispatch(removeItem('1'));
    expect(selectCartItems(store.getState()).map((i) => i.id)).toEqual(['2']);
    store.dispatch(clearCart());
    expect(selectCartItems(store.getState())).toEqual([]);
    store.dispatch(
      hydrateCart({
        items: [{ id: '9', name: 'x', description: 'd', image: '/i.webp', price: 1, quantity: 3 }],
        checkoutCompleted: false,
      }),
    );
    expect(selectCartCount(store.getState())).toBe(3);
  });

  it('completing checkout empties the cart and flags completion; adding resets the flag', () => {
    const store = makeStore();
    store.dispatch(addItem(staff));
    store.dispatch(completeCheckout());
    expect(selectCartItems(store.getState())).toEqual([]);
    expect(selectCheckoutCompleted(store.getState())).toBe(true);
    store.dispatch(addItem(lantern));
    expect(selectCheckoutCompleted(store.getState())).toBe(false);
  });
});
```

`src/features/cart/cartPersistence.test.ts`:

```ts
import { CART_STORAGE_KEY, loadCartState, saveCartState } from './cartPersistence';

describe('cart persistence', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips state through localStorage', () => {
    const state = {
      items: [{ id: '1', name: 'a', description: 'd', image: '/i.webp', price: 2, quantity: 1 }],
      checkoutCompleted: false,
    };
    saveCartState(state);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) as string)).toEqual(state);
    expect(loadCartState()).toEqual(state);
  });

  it('returns undefined when nothing is stored or the payload is corrupt', () => {
    expect(loadCartState()).toBeUndefined();
    localStorage.setItem(CART_STORAGE_KEY, '{not json');
    expect(loadCartState()).toBeUndefined();
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: 'nope' }));
    expect(loadCartState()).toBeUndefined();
  });
});
```

Run: `npm test -- cart` → Expected: FAIL (modules not found).

- [ ] **Step 3: Implement slices, store, persistence**

`src/features/cart/cartSlice.ts`:

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/lib/api/types';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  /** True right after "FINALIZAR COMPRA" so the button can show "COMPRA FINALIZADA!". */
  checkoutCompleted: boolean;
}

export const initialCartState: CartState = { items: [], checkoutCompleted: false };

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addItem(state, action: PayloadAction<Product>) {
      const { id, name, description, image, price } = action.payload;
      const existing = state.items.find((item) => item.id === id);
      if (existing) existing.quantity += 1;
      else state.items.push({ id, name, description, image, price, quantity: 1 });
      state.checkoutCompleted = false;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    incrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      if (item.quantity <= 1) state.items = state.items.filter((i) => i.id !== action.payload);
      else item.quantity -= 1;
    },
    setQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
        return;
      }
      const item = state.items.find((i) => i.id === id);
      if (item) item.quantity = Math.floor(quantity);
    },
    clearCart(state) {
      state.items = [];
    },
    hydrateCart(_state, action: PayloadAction<CartState>) {
      return action.payload;
    },
    completeCheckout(state) {
      state.items = [];
      state.checkoutCompleted = true;
    },
    resetCheckout(state) {
      state.checkoutCompleted = false;
    },
  },
});

export const {
  addItem,
  removeItem,
  incrementItem,
  decrementItem,
  setQuantity,
  clearCart,
  hydrateCart,
  completeCheckout,
  resetCheckout,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
```

`src/features/cart/cartSelectors.ts`:

```ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCheckoutCompleted = (state: RootState) => state.cart.checkoutCompleted;
export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);
export const selectCartTotal = createSelector(selectCartItems, (items) =>
  Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(6)),
);
export const selectCartItemById = (id: string) => (state: RootState) =>
  state.cart.items.find((item) => item.id === id);
export const selectIsInCart = (id: string) => (state: RootState) =>
  state.cart.items.some((item) => item.id === id);
```

`src/features/ui/uiSlice.ts`:

```ts
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

interface UiState {
  isCartOpen: boolean;
}
const initialState: UiState = { isCartOpen: false };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCart(state) {
      state.isCartOpen = true;
    },
    closeCart(state) {
      state.isCartOpen = false;
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
  },
});

export const { openCart, closeCart, toggleCart } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
export const selectIsCartOpen = (state: RootState) => state.ui.isCartOpen;
```

`src/store/store.ts`:

```ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '@/features/cart/cartSlice';
import { uiReducer } from '@/features/ui/uiSlice';

const rootReducer = combineReducers({ cart: cartReducer, ui: uiReducer });

export type RootState = ReturnType<typeof rootReducer>;

/** One store per request on the server, one per browser session on the client. */
export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
```

`src/store/hooks.ts`:

```ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

`src/features/cart/cartPersistence.ts`:

```ts
import type { AppStore } from '@/store/store';
import { hydrateCart, type CartItem, type CartState } from './cartSlice';

export const CART_STORAGE_KEY = 'starsoft-cart:v1';

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.image === 'string' &&
    typeof v.price === 'number' &&
    typeof v.quantity === 'number' &&
    v.quantity > 0
  );
}

export function loadCartState(): CartState | undefined {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { items?: unknown; checkoutCompleted?: unknown };
    if (!Array.isArray(parsed.items) || !parsed.items.every(isCartItem)) return undefined;
    return { items: parsed.items, checkoutCompleted: parsed.checkoutCompleted === true };
  } catch {
    return undefined;
  }
}

export function saveCartState(state: CartState): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable (private mode); the cart still works in memory
  }
}

/** Hydrate from storage once, then mirror every cart change back. Returns the unsubscribe function. */
export function bindCartPersistence(store: AppStore): () => void {
  const stored = loadCartState();
  if (stored) store.dispatch(hydrateCart(stored));
  let last = store.getState().cart;
  return store.subscribe(() => {
    const next = store.getState().cart;
    if (next !== last) {
      last = next;
      saveCartState(next);
    }
  });
}
```

`src/store/StoreProvider.tsx`:

```tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { bindCartPersistence } from '@/features/cart/cartPersistence';
import { makeStore, type AppStore } from './store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);
  // Runs only in the browser after hydration, so SSR HTML and first client render match.
  useEffect(() => bindCartPersistence(store), [store]);
  return <Provider store={store}>{children}</Provider>;
}
```

`src/features/cart/useCart.ts`:

```ts
'use client';

import { useCallback } from 'react';
import type { Product } from '@/lib/api/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeCart, openCart, selectIsCartOpen, toggleCart } from '@/features/ui/uiSlice';
import { addItem, completeCheckout, decrementItem, incrementItem, removeItem } from './cartSlice';
import {
  selectCartCount,
  selectCartItems,
  selectCartTotal,
  selectCheckoutCompleted,
} from './cartSelectors';

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal);
  const isOpen = useAppSelector(selectIsCartOpen);
  const checkoutCompleted = useAppSelector(selectCheckoutCompleted);

  return {
    items,
    count,
    total,
    isOpen,
    checkoutCompleted,
    add: useCallback((product: Product) => dispatch(addItem(product)), [dispatch]),
    remove: useCallback((id: string) => dispatch(removeItem(id)), [dispatch]),
    increment: useCallback((id: string) => dispatch(incrementItem(id)), [dispatch]),
    decrement: useCallback((id: string) => dispatch(decrementItem(id)), [dispatch]),
    open: useCallback(() => dispatch(openCart()), [dispatch]),
    close: useCallback(() => dispatch(closeCart()), [dispatch]),
    toggle: useCallback(() => dispatch(toggleCart()), [dispatch]),
    finishCheckout: useCallback(() => dispatch(completeCheckout()), [dispatch]),
  };
}
```

Update `src/app/providers.tsx` to nest `StoreProvider` outside `QueryClientProvider`:

```tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getQueryClient } from '@/lib/query/getQueryClient';
import { StoreProvider } from '@/store/StoreProvider';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </StoreProvider>
  );
}
```

Replace `src/test/renderWithProviders.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore, type RootState } from '@/store/store';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  queryClient?: QueryClient;
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = makeStore(preloadedState),
    queryClient = createTestQueryClient(),
    ...options
  }: Options = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  }
  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
```

- [ ] **Step 4: Run tests, verify, commit**

`npm test` → all pass (cart: 7, persistence: 2, plus earlier). `npm run lint && npm run typecheck && npm run format:check && npm run build`.

```bash
git add src/store src/features src/app/providers.tsx src/test package.json package-lock.json
git commit -m "feat: add Redux Toolkit store with persisted cart slice and UI slice

Cart state (items, quantities, checkout flag) and drawer visibility live in
Redux; the cart is hydrated from localStorage after mount and mirrored back
on every change."
```

---

### Task 9: Icons and UI primitives (Button, IconButton, PriceEth, ProgressBar, Skeleton, EmptyState, ErrorState)

**Files:**

- Create: `src/components/icons/EthIcon.tsx`, `BagIcon.tsx`, `TrashIcon.tsx`, `ArrowLeftIcon.tsx`; `src/components/ui/Button/Button.tsx`, `Button.module.scss`, `Button.test.tsx`; `src/components/ui/IconButton/IconButton.tsx`, `IconButton.module.scss`; `src/components/ui/PriceEth/PriceEth.tsx`, `PriceEth.module.scss`, `PriceEth.test.tsx`; `src/components/ui/ProgressBar/ProgressBar.tsx`, `ProgressBar.module.scss`, `ProgressBar.test.tsx`; `src/components/ui/Skeleton/Skeleton.tsx`, `Skeleton.module.scss`; `src/components/ui/EmptyState/EmptyState.tsx`, `EmptyState.module.scss`; `src/components/ui/ErrorState/ErrorState.tsx`, `ErrorState.module.scss`, `ErrorState.test.tsx`

**Interfaces:**

- Produces:
  - `Button` props: `variant?: 'primary' | 'secondary'` (primary `#FF8310`, secondary `#393939`), `fullWidth?: boolean`, `isLoading?: boolean`, plus native `button` props; forwards `ref`; renders `<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>`.
  - `IconButton` props: `label: string` (aria-label), `variant?: 'primary' | 'surface'` (circle orange / circle `#393939`), `size?: number` (default 40), native button props.
  - `PriceEth` props: `value: number`, `size?: 'md' | 'lg'` → `<span><EthIcon /> 32 ETH</span>`.
  - `ProgressBar` props: `value: number`, `max: number`, `label: string` → `<div role="progressbar" aria-valuenow aria-valuemin="0" aria-valuemax aria-label>`.
  - `Skeleton` props: `width?`, `height?`, `radius?`, `className?`.
  - `EmptyState` props: `title: string`, `description?: string`, `action?: ReactNode`.
  - `ErrorState` props: `title?: string` (default `Algo deu errado`), `message?: string`, `onRetry?: () => void` (renders `Tentar novamente` button when provided).
  - Icons accept `size?: number` and `className?`; `aria-hidden` by default.

- [ ] **Step 1: Install framer-motion**

```bash
npm install framer-motion@13
```

- [ ] **Step 2: Icons (inline SVG, design-matched)**

`src/components/icons/EthIcon.tsx` (blue/purple diamond in a circle like the screenshot):

```tsx
interface IconProps {
  size?: number;
  className?: string;
  title?: string;
}

export function EthIcon({ size = 24, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="12" fill="#6F6CF0" />
      <path d="M12 4.5 7.5 12l4.5 2.7 4.5-2.7L12 4.5Z" fill="#fff" fillOpacity="0.95" />
      <path d="M12 15.8 7.5 13.1 12 19.5l4.5-6.4-4.5 2.7Z" fill="#fff" fillOpacity="0.7" />
    </svg>
  );
}
```

`BagIcon.tsx` (outlined bag, `stroke="currentColor"`, strokeWidth 1.6: body `M5 8h14l-1 12H6L5 8Z`, handle `M9 8V6a3 3 0 0 1 6 0v2`), `TrashIcon.tsx` (outlined trash: lid `M4 7h16`, can `M6 7l1 13h10l1-13`, handle `M9 7V4h6v3`, `stroke="currentColor"`), `ArrowLeftIcon.tsx` (`M19 12H5` + `M12 19l-7-7 7-7`, `stroke="currentColor"`, strokeWidth 2, round caps). All use the same `IconProps` and `aria-hidden` pattern.

- [ ] **Step 3: Failing tests**

`src/components/ui/Button/Button.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and calls onClick', async () => {
    const onClick = jest.fn();
    renderWithProviders(<Button onClick={onClick}>Comprar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and busy while loading', () => {
    renderWithProviders(<Button isLoading>Carregar mais</Button>);
    const button = screen.getByRole('button', { name: 'Carregar mais' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
```

`src/components/ui/PriceEth/PriceEth.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PriceEth } from './PriceEth';

it('formats the ETH price with an accessible label', () => {
  renderWithProviders(<PriceEth value={32} />);
  expect(screen.getByText('32 ETH')).toBeInTheDocument();
});
```

`src/components/ui/ProgressBar/ProgressBar.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ProgressBar } from './ProgressBar';

it('exposes progress semantics', () => {
  renderWithProviders(<ProgressBar value={8} max={16} label="Produtos carregados" />);
  const bar = screen.getByRole('progressbar', { name: 'Produtos carregados' });
  expect(bar).toHaveAttribute('aria-valuenow', '8');
  expect(bar).toHaveAttribute('aria-valuemax', '16');
});
```

`src/components/ui/ErrorState/ErrorState.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ErrorState } from './ErrorState';

it('shows the message and retries', async () => {
  const onRetry = jest.fn();
  renderWithProviders(<ErrorState message="Falha ao carregar" onRetry={onRetry} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(onRetry).toHaveBeenCalled();
});
```

Run: `npm test -- components/ui` → Expected: FAIL (modules not found).

- [ ] **Step 4: Implement**

`src/components/ui/Button/Button.tsx`:

```tsx
'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import styles from './Button.module.scss';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    fullWidth = false,
    isLoading = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;
  return (
    <motion.button
      ref={ref}
      type={type}
      className={[
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
        className ?? '',
      ]
        .join(' ')
        .trim()}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
```

`src/components/ui/Button/Button.module.scss`:

```scss
@use 'mixins' as *;

.button {
  @include label-uppercase;
  @include focus-ring;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius);
  font-size: var(--fs-sm);
  line-height: 1;
  color: var(--color-text);
  transition:
    filter 150ms ease,
    opacity 150ms ease;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    filter: brightness(1.08);
  }
}
.primary {
  background: var(--color-primary);
}
.secondary {
  background: var(--color-surface-alt);
  text-transform: none;
  font-weight: 500;
  font-size: var(--fs-md);
  letter-spacing: 0;
}
.fullWidth {
  width: 100%;
}
```

`IconButton.tsx`: a plain `<button>` (no motion) with `aria-label={label}`, `className={[styles.iconButton, styles[variant]].join(' ')}`, `style={{ width: size, height: size }}`; SCSS: `border-radius: 50%; display: grid; place-items: center; @include focus-ring;` `.primary { background: var(--color-primary); color: #fff }` `.surface { background: var(--color-surface-alt); color: var(--color-primary) }`.

`PriceEth.tsx`:

```tsx
import { EthIcon } from '@/components/icons/EthIcon';
import { formatEth } from '@/lib/format/eth';
import styles from './PriceEth.module.scss';

export function PriceEth({ value, size = 'md' }: { value: number; size?: 'md' | 'lg' }) {
  return (
    <span className={[styles.price, styles[size]].join(' ')}>
      <EthIcon size={size === 'lg' ? 28 : 24} />
      <span>{formatEth(value)}</span>
    </span>
  );
}
```

SCSS: `.price { display: inline-flex; align-items: center; gap: var(--space-2); font-weight: 600; font-size: var(--fs-md); } .lg { font-size: var(--fs-lg); }`.

`ProgressBar.tsx`:

```tsx
import styles from './ProgressBar.module.scss';

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
```

SCSS: `.track { width: 100%; height: 6px; border-radius: 999px; background: var(--color-surface-alt); overflow: hidden } .fill { height: 100%; background: var(--color-primary); border-radius: inherit; transition: width 400ms ease }`.

`Skeleton.tsx`: `<div aria-hidden className={styles.skeleton} style={{ width, height, borderRadius: radius }} />` with SCSS shimmer: `background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-alt) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; @keyframes shimmer { to { background-position: -200% 0 } }`.

`EmptyState.tsx`: `<div className={styles.empty} role="status"><h2>{title}</h2>{description && <p>{description}</p>}{action}</div>`; SCSS centred text, muted description, `padding: var(--space-8) var(--space-4)`.

`ErrorState.tsx`:

```tsx
'use client';

import { Button } from '@/components/ui/Button/Button';
import styles from './ErrorState.module.scss';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Run tests, verify, commit**

`npm test` → all pass. `npm run lint && npm run typecheck && npm run format:check`.

```bash
git add src/components package.json package-lock.json
git commit -m "feat: add icon set and UI primitives (Button, IconButton, PriceEth, ProgressBar, states)"
```

---

### Task 10: Header, cart button with badge, logo, footer, skip link, layout composition

**Files:**

- Create: `src/components/layout/Logo/Logo.tsx`, `Logo.module.scss`; `src/components/layout/SkipLink/SkipLink.tsx`, `SkipLink.module.scss`; `src/components/cart/CartButton/CartButton.tsx`, `CartButton.module.scss`, `CartButton.test.tsx`; `src/components/layout/Header/Header.tsx`, `Header.module.scss`, `Header.test.tsx`; `src/components/layout/Footer/Footer.tsx`, `Footer.module.scss`
- Modify: `src/app/layout.tsx`

**Interfaces:**

- Consumes: `useCart()` (Task 8), `BagIcon`.
- Produces: `<Header />` (server component containing client `CartButton`), `<Footer />`, `<SkipLink />`; `main` element id `main-content`.

- [ ] **Step 1: Failing tests**

`src/components/cart/CartButton/CartButton.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { selectIsCartOpen } from '@/features/ui/uiSlice';
import { CartButton } from './CartButton';

describe('CartButton', () => {
  it('shows the total quantity from the store', () => {
    renderWithProviders(<CartButton />, {
      preloadedState: {
        cart: {
          checkoutCompleted: false,
          items: [
            { id: '1', name: 'a', description: 'd', image: '/i.webp', price: 1, quantity: 2 },
            { id: '2', name: 'b', description: 'd', image: '/i.webp', price: 1, quantity: 1 },
          ],
        },
      },
    });
    expect(screen.getByRole('button', { name: 'Abrir carrinho, 3 itens' })).toHaveTextContent('3');
  });

  it('opens the cart drawer', async () => {
    const { store } = renderWithProviders(<CartButton />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir carrinho, 0 itens' }));
    expect(selectIsCartOpen(store.getState())).toBe(true);
  });
});
```

`src/components/layout/Header/Header.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Header } from './Header';

it('renders the logo link to home and the cart button', () => {
  renderWithProviders(<Header />);
  expect(screen.getByRole('link', { name: 'starsoft - página inicial' })).toHaveAttribute(
    'href',
    '/',
  );
  expect(screen.getByRole('button', { name: /Abrir carrinho/ })).toBeInTheDocument();
});
```

Run: `npm test -- CartButton Header` → FAIL (modules not found).

- [ ] **Step 2: Implement**

`src/components/layout/Logo/Logo.tsx`:

```tsx
import Link from 'next/link';
import styles from './Logo.module.scss';

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="starsoft - página inicial">
      starsoft
    </Link>
  );
}
```

SCSS: `.logo { font-weight: 700; font-size: 1.375rem; color: var(--color-primary); letter-spacing: -0.02em; transform: rotate(-4deg); display: inline-block; @include focus-ring; }` (the wordmark in the screenshot is a rounded, slightly tilted display face; Task 18 may swap in an SVG wordmark).

`src/components/cart/CartButton/CartButton.tsx`:

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BagIcon } from '@/components/icons/BagIcon';
import { useCart } from '@/features/cart/useCart';
import styles from './CartButton.module.scss';

export function CartButton() {
  const { count, open } = useCart();
  const label = `Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`;
  return (
    <button
      type="button"
      className={styles.cartButton}
      onClick={open}
      aria-label={label}
      aria-haspopup="dialog"
    >
      <BagIcon size={28} className={styles.icon} />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={count}
          className={styles.count}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-hidden
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```

SCSS: `.cartButton { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--color-primary); @include focus-ring; } .count { color: var(--color-text); font-size: var(--fs-lg); font-weight: 500; min-width: 1ch; }`.

`src/components/layout/Header/Header.tsx`:

```tsx
import { CartButton } from '@/components/cart/CartButton/CartButton';
import { Logo } from '@/components/layout/Logo/Logo';
import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />
        <CartButton />
      </div>
    </header>
  );
}
```

SCSS: `.header { position: sticky; top: 0; z-index: 20; background: var(--color-background); border-bottom: 1px solid var(--color-border); } .inner { @include container; display: flex; align-items: center; justify-content: space-between; height: 100px; @include down($bp-sm) { height: 72px; } }`.

`Footer.tsx`: `<footer className={styles.footer}><p>Starsoft © Todos os direitos reservados</p></footer>` with SCSS `text-transform: uppercase; font-size: var(--fs-xs); letter-spacing: 0.12em; color: var(--color-text-muted); text-align: center; padding: var(--space-8) var(--space-4);`.

`SkipLink.tsx`: `<a href="#main-content" className={styles.skipLink}>Pular para o conteúdo</a>` with SCSS visually hidden until `:focus` (then fixed top-left, orange background).

`src/app/layout.tsx` body becomes:

```tsx
<body>
  <Providers>
    <SkipLink />
    <Header />
    <main id="main-content" className="page-main">
      {children}
    </main>
    <Footer />
  </Providers>
</body>
```

Add to `globals.scss`: `.page-main { min-height: calc(100vh - 100px - 96px); }` and in `ProductsProbe` change the wrapper `<main>` to `<div>` (only one `main` per page).

- [ ] **Step 3: Verify and commit**

`npm test` → pass. `npm run dev` → header with orange "starsoft" left, bag + `0` right, footer text; count is `0` after reload and, after `localStorage.setItem('starsoft-cart:v1', JSON.stringify({items:[{id:'1',name:'a',description:'d',image:'/images/item-01.webp',price:1,quantity:4}],checkoutCompleted:false}))` + reload, shows `4`. `npm run lint && npm run typecheck && npm run format:check`.

```bash
git add src/components src/app/layout.tsx src/app/ProductsProbe.tsx src/styles/globals.scss
git commit -m "feat: add header with cart badge, logo, footer and skip link"
```

---

### Task 11: ProductCard and ProductGrid (TDD)

**Files:**

- Create: `src/components/product/ProductCard/ProductCard.tsx`, `ProductCard.module.scss`, `ProductCard.test.tsx`; `src/components/product/ProductGrid/ProductGrid.tsx`, `ProductGrid.module.scss`; `src/components/product/ProductGrid/ProductGridSkeleton.tsx`

**Interfaces:**

- Consumes: `Product`, `useCart()`, `Button`, `PriceEth`, `Skeleton`.
- Produces: `<ProductCard product={Product} priority?: boolean />` (`priority` → `next/image` `priority` for above-the-fold cards); `<ProductGrid>{children}</ProductGrid>` (responsive CSS grid `<ul>`); `<ProductGridSkeleton count?: number />`.

- [ ] **Step 1: Failing test**

`src/components/product/ProductCard/ProductCard.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { selectCartItems } from '@/features/cart/cartSelectors';
import { products } from '@/mocks/fixtures/products';
import { ProductCard } from './ProductCard';

const product = products[0];

describe('ProductCard', () => {
  it('renders name, description, price and image', () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument();
    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByText('32 ETH')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: product.name })).toBeInTheDocument();
  });

  it('links to the product detail page', () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByRole('link', { name: product.name })).toHaveAttribute(
      'href',
      `/products/${product.id}`,
    );
  });

  it('adds to the cart and switches the button label in place', async () => {
    const { store } = renderWithProviders(<ProductCard product={product} />);
    await userEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(selectCartItems(store.getState())).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Adicionado ao carrinho' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Adicionado ao carrinho' }));
    expect(selectCartItems(store.getState())[0].quantity).toBe(2);
  });
});
```

Run: `npm test -- ProductCard` → FAIL.

- [ ] **Step 2: Implement**

`src/components/product/ProductCard/ProductCard.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { PriceEth } from '@/components/ui/PriceEth/PriceEth';
import { useCart } from '@/features/cart/useCart';
import { useAppSelector } from '@/store/hooks';
import { selectIsInCart } from '@/features/cart/cartSelectors';
import type { Product } from '@/lib/api/types';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { add } = useCart();
  const inCart = useAppSelector(selectIsInCart(product.id));

  return (
    <motion.article
      className={styles.card}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      data-testid="product-card"
    >
      <Link href={`/products/${product.id}`} className={styles.thumbnail} aria-label={product.name}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 300px"
          priority={priority}
          className={styles.image}
        />
      </Link>
      <div className={styles.body}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <PriceEth value={product.price} />
      </div>
      <Button fullWidth onClick={() => add(product)} aria-pressed={inCart}>
        {inCart ? 'Adicionado ao carrinho' : 'Comprar'}
      </Button>
    </motion.article>
  );
}
```

Note: the labels are written in sentence case and rendered uppercase by CSS (`label-uppercase`), so tests match `Comprar`/`Adicionado ao carrinho` while the UI shows `COMPRAR`/`ADICIONADO AO CARRINHO`.

`ProductCard.module.scss`:

```scss
@use 'mixins' as *;

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: var(--space-5);
  height: 100%;
}
.thumbnail {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius);
  background: var(--color-background);
  overflow: hidden;
  @include focus-ring;
}
.image {
  object-fit: contain;
  padding: 8%;
}
.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}
.title {
  font-size: var(--fs-md);
  font-weight: 500;
}
.description {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
```

`ProductGrid.tsx`:

```tsx
import type { ReactNode } from 'react';
import styles from './ProductGrid.module.scss';

export function ProductGrid({ children }: { children: ReactNode }) {
  return <ul className={styles.grid}>{children}</ul>;
}
```

`ProductGrid.module.scss`:

```scss
@use 'variables' as *;
@use 'mixins' as *;

.grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr;
  @include up($bp-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  @include up($bp-md) {
    grid-template-columns: repeat(3, 1fr);
  }
  @include up($bp-lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

`ProductGridSkeleton.tsx`: renders `<ProductGrid>` with `count` (default 8) `<li>` each containing a `#232323` card of `Skeleton` blocks (square 1:1, two text lines, one 48px button). Mark the wrapper `aria-busy="true"` with visually-hidden text `Carregando produtos`.

- [ ] **Step 3: Verify and commit**

`npm test` → pass. `npm run lint && npm run typecheck && npm run format:check`.

```bash
git add src/components/product
git commit -m "feat: add ProductCard with add-to-cart state and responsive ProductGrid"
```

---

### Task 12: Home listing: ProductList with load more + progress bar, SSR prefetch, loading/error/empty states

**Files:**

- Create: `src/components/product/LoadMore/LoadMore.tsx`, `LoadMore.module.scss`; `src/components/product/ProductList/ProductList.tsx`, `ProductList.module.scss`, `ProductList.test.tsx`; `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`
- Modify: `src/app/page.tsx`; delete `src/app/ProductsProbe.tsx`

**Interfaces:**

- Consumes: `productsInfiniteQueryOptions`, `ProductCard`, `ProductGrid`, `ProductGridSkeleton`, `ProgressBar`, `Button`, `ErrorState`, `EmptyState`.
- Produces: `<ProductList />` (client), `<LoadMore loaded max hasNextPage isFetching onLoadMore />`.

- [ ] **Step 1: Failing integration test**

`src/components/product/ProductList/ProductList.test.tsx`:

```tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/renderWithProviders';
import { env } from '@/lib/config/env';
import { server } from '@/mocks/server';
import { ProductList } from './ProductList';

describe('ProductList', () => {
  it('shows a skeleton, then the first page, then loads more until the end', async () => {
    renderWithProviders(<ProductList />);
    expect(screen.getByText('Carregando produtos')).toBeInTheDocument();
    expect(await screen.findAllByTestId('product-card')).toHaveLength(8);
    expect(screen.getByRole('progressbar', { name: 'Produtos carregados' })).toHaveAttribute(
      'aria-valuenow',
      '8',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(16));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '16');
    expect(screen.getByRole('button', { name: 'Você já viu tudo' })).toBeDisabled();
  });

  it('shows an error state with retry', async () => {
    server.use(
      http.get(
        `${env.apiBaseUrl}/products`,
        () => HttpResponse.json({ message: 'down' }, { status: 500 }),
        { once: true },
      ),
    );
    renderWithProviders(<ProductList />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findAllByTestId('product-card')).toHaveLength(8);
  });

  it('shows an empty state when the API returns no products', async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/products`, () =>
        HttpResponse.json({
          data: [],
          metadata: { page: 1, limit: 8, total: 0, totalPages: 1, hasNextPage: false },
        }),
      ),
    );
    renderWithProviders(<ProductList />);
    expect(await screen.findByText('Nenhum produto encontrado')).toBeInTheDocument();
  });
});
```

Run: `npm test -- ProductList` → FAIL.

- [ ] **Step 2: Implement LoadMore and ProductList**

`src/components/product/LoadMore/LoadMore.tsx`:

```tsx
'use client';

import { Button } from '@/components/ui/Button/Button';
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar';
import styles from './LoadMore.module.scss';

interface LoadMoreProps {
  loaded: number;
  max: number;
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}

export function LoadMore({ loaded, max, hasNextPage, isFetching, onLoadMore }: LoadMoreProps) {
  return (
    <div className={styles.loadMore}>
      <ProgressBar value={loaded} max={max} label="Produtos carregados" />
      <Button
        variant="secondary"
        fullWidth
        onClick={onLoadMore}
        disabled={!hasNextPage}
        isLoading={isFetching}
      >
        {hasNextPage ? 'Carregar mais' : 'Você já viu tudo'}
      </Button>
    </div>
  );
}
```

SCSS: `.loadMore { width: min(100%, 370px); margin: var(--space-8) auto 0; display: flex; flex-direction: column; gap: var(--space-3); }`.

`src/components/product/ProductList/ProductList.tsx`:

```tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState/ErrorState';
import { LoadMore } from '@/components/product/LoadMore/LoadMore';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGrid/ProductGridSkeleton';
import { productsInfiniteQueryOptions } from '@/lib/query/queries';
import styles from './ProductList.module.scss';

export function ProductList() {
  const { data, status, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(productsInfiniteQueryOptions());

  if (status === 'pending') return <ProductGridSkeleton />;
  if (status === 'error')
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  const products = data.pages.flatMap((page) => page.data);
  const total = data.pages[0]?.metadata.total ?? 0;
  if (products.length === 0)
    return (
      <EmptyState
        title="Nenhum produto encontrado"
        description="Volte mais tarde para conferir novos itens."
      />
    );

  return (
    <section className={styles.list} aria-labelledby="products-heading">
      <h2 id="products-heading" className={styles.srOnly}>
        Produtos
      </h2>
      <ProductGrid>
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ProductGrid>
      <LoadMore
        loaded={products.length}
        max={total}
        hasNextPage={Boolean(hasNextPage)}
        isFetching={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
      />
    </section>
  );
}
```

SCSS: `.list { @include container; padding-block: var(--space-8) var(--space-7); } .srOnly { @include visually-hidden; }`.

- [ ] **Step 3: Home page, loading, error, not-found**

`src/app/page.tsx`:

```tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { ProductList } from '@/components/product/ProductList/ProductList';
import { getQueryClient } from '@/lib/query/getQueryClient';
import { productsInfiniteQueryOptions } from '@/lib/query/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Starsoft NFT Marketplace',
  description: 'Explore e compre NFTs exclusivos com pagamento em ETH.',
  openGraph: {
    title: 'Starsoft NFT Marketplace',
    description: 'Explore e compre NFTs exclusivos com pagamento em ETH.',
    type: 'website',
    images: ['/images/item-01.webp'],
  },
};

export default async function HomePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(productsInfiniteQueryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList />
    </HydrationBoundary>
  );
}
```

`src/app/loading.tsx`: `import { ProductGridSkeleton } ...; export default function Loading() { return <div className="page-container"><ProductGridSkeleton /></div>; }` (add `.page-container { @include container; padding-block: var(--space-8); }` to `globals.scss`).
`src/app/error.tsx`:

```tsx
'use client';

import { ErrorState } from '@/components/ui/ErrorState/ErrorState';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-container">
      <ErrorState message={error.message} onRetry={reset} />
    </div>
  );
}
```

`src/app/not-found.tsx`: `EmptyState` with title `Página não encontrada`, action `<Link href="/">Voltar para a loja</Link>` styled via `Button`-like class (use a `<Link className={buttonStyles.button + ' ' + buttonStyles.primary}>` importing `Button.module.scss`).
Delete `src/app/ProductsProbe.tsx`.

- [ ] **Step 4: Verify**

`npm test` → pass. `npm run dev`: home shows 8 cards in 4 columns at ≥1280px, 3 at 1024-1279, 2 at 640-1023, 1 below; progress bar half orange; `Carregar mais` loads 8 more, bar fills, button becomes disabled `VOCÊ JÁ VIU TUDO`; `COMPRAR` → `ADICIONADO AO CARRINHO` and header count increments; `curl -s localhost:3000 | grep -c "Cajado Estelar"` ≥ 1 (SSR). Compare side by side with `docs/design/01-home-grid.png`. `npm run lint && npm run typecheck && npm run format:check && npm run build`.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components/product src/styles/globals.scss
git rm -q src/app/ProductsProbe.tsx
git commit -m "feat: add server-rendered product listing with load more and progress

Prefetch the first page on the server and hydrate React Query so the grid
is in the SSR HTML; subsequent pages accumulate via useInfiniteQuery."
```

---

### Task 13: Product detail dynamic route with `generateMetadata`

**Files:**

- Create: `src/app/products/[id]/page.tsx`, `src/app/products/[id]/loading.tsx`, `src/app/products/[id]/error.tsx`; `src/components/product/ProductDetails/ProductDetails.tsx`, `ProductDetails.module.scss`, `ProductDetails.test.tsx`; `src/lib/api/getProductCached.ts`

**Interfaces:**

- Consumes: `productQueryOptions`, `productsService.getById`, `ApiError`, `useCart`, `Button`, `PriceEth`.
- Produces: route `/products/[id]`; `<ProductDetails id={string} />` (client); `getProductCached(id)` (React `cache()` wrapper used by both `generateMetadata` and the page so the product is fetched once per request).

- [ ] **Step 1: Failing test**

`src/components/product/ProductDetails/ProductDetails.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { selectCartCount } from '@/features/cart/cartSelectors';
import { ProductDetails } from './ProductDetails';

describe('ProductDetails', () => {
  it('loads and renders the product, and adds it to the cart', async () => {
    const { store } = renderWithProviders(<ProductDetails id="2" />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Lanterna Espectral' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 ETH')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para a loja' })).toHaveAttribute('href', '/');
    await userEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(selectCartCount(store.getState())).toBe(1);
  });

  it('shows an error state for unknown ids', async () => {
    renderWithProviders(<ProductDetails id="missing" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Product not found');
  });
});
```

Run: `npm test -- ProductDetails` → FAIL.

- [ ] **Step 2: Implement**

`src/lib/api/getProductCached.ts`:

```ts
import { cache } from 'react';
import { productsService } from './products.service';

/** Deduplicates the product fetch between generateMetadata and the page within one server request. */
export const getProductCached = cache((id: string) => productsService.getById(id));
```

`src/components/product/ProductDetails/ProductDetails.tsx`:

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';
import { Button } from '@/components/ui/Button/Button';
import { ErrorState } from '@/components/ui/ErrorState/ErrorState';
import { PriceEth } from '@/components/ui/PriceEth/PriceEth';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { selectIsInCart } from '@/features/cart/cartSelectors';
import { useCart } from '@/features/cart/useCart';
import { productQueryOptions } from '@/lib/query/queries';
import { useAppSelector } from '@/store/hooks';
import styles from './ProductDetails.module.scss';

export function ProductDetails({ id }: { id: string }) {
  const { data: product, status, error, refetch } = useQuery(productQueryOptions(id));
  const { add } = useCart();
  const inCart = useAppSelector(selectIsInCart(id));

  if (status === 'pending') return <ProductDetailsSkeleton />;
  if (status === 'error')
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  return (
    <article className={styles.details}>
      <Link href="/" className={styles.back}>
        <ArrowLeftIcon size={20} /> Voltar para a loja
      </Link>
      <div className={styles.layout}>
        <div className={styles.thumbnail}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 90vw, 560px"
            priority
            className={styles.image}
          />
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>
          <PriceEth value={product.price} size="lg" />
          <Button fullWidth onClick={() => add(product)} aria-pressed={inCart}>
            {inCart ? 'Adicionado ao carrinho' : 'Comprar'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className={styles.layout} aria-busy="true">
      <Skeleton height="min(560px, 90vw)" radius="var(--radius)" />
      <div className={styles.info}>
        <Skeleton height={32} width="60%" />
        <Skeleton height={20} />
        <Skeleton height={28} width={120} />
        <Skeleton height={48} />
      </div>
    </div>
  );
}
```

SCSS: `.details { @include container; padding-block: var(--space-7) var(--space-8); } .back { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--color-primary); margin-bottom: var(--space-6); @include focus-ring; } .layout { display: grid; gap: var(--space-6); @include up($bp-md) { grid-template-columns: minmax(0, 560px) minmax(0, 1fr); align-items: start; } } .thumbnail { position: relative; aspect-ratio: 1; background: var(--color-surface); border-radius: var(--radius); overflow: hidden; } .image { object-fit: contain; padding: 8%; } .info { display: flex; flex-direction: column; gap: var(--space-4); background: var(--color-surface); border-radius: var(--radius); padding: var(--space-6); } .title { font-size: var(--fs-xl); font-weight: 500; } .description { color: var(--color-text-muted); }`.

`src/app/products/[id]/page.tsx`:

```tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product/ProductDetails/ProductDetails';
import { ApiError } from '@/lib/api/client';
import { getProductCached } from '@/lib/api/getProductCached';
import { getQueryClient } from '@/lib/query/getQueryClient';
import { productQueryOptions } from '@/lib/query/queries';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProductCached(id);
    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.image],
        type: 'website',
      },
    };
  } catch {
    return { title: 'Produto não encontrado' };
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const queryClient = getQueryClient();
  try {
    const product = await getProductCached(id);
    queryClient.setQueryData(productQueryOptions(id).queryKey, product);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error; // rendered by products/[id]/error.tsx
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetails id={id} />
    </HydrationBoundary>
  );
}
```

`loading.tsx`: `<div className="page-container"><ProductDetailsSkeleton /></div>`. `error.tsx`: same shape as the root one (client, `ErrorState` + `reset`).

- [ ] **Step 3: Verify and commit**

`npm test` → pass. `npm run dev`: click a card image → `/products/1` renders SSR (`curl -s localhost:3000/products/2 | grep -c "Lanterna Espectral"` ≥ 1; `curl -s -o /dev/null -w "%{http_code}" localhost:3000/products/zzz` → `404`); `<title>` is `Lanterna Espectral | Starsoft`. `npm run lint && npm run typecheck && npm run format:check`.

```bash
git add src/app/products src/components/product/ProductDetails src/lib/api/getProductCached.ts
git commit -m "feat: add product detail dynamic route with SSR and generateMetadata"
```

---

### Task 14: Cart drawer ("Mochila de Compras") with stepper, remove, total, finalizar (TDD)

**Files:**

- Create: `src/components/cart/QuantityStepper/QuantityStepper.tsx`, `QuantityStepper.module.scss`; `src/components/cart/CartItemRow/CartItemRow.tsx`, `CartItemRow.module.scss`; `src/components/cart/CartSummary/CartSummary.tsx`, `CartSummary.module.scss`; `src/components/cart/CartDrawer/CartDrawer.tsx`, `CartDrawer.module.scss`, `CartDrawer.test.tsx`, `CartDrawerHost.tsx`
- Modify: `src/app/layout.tsx` (mount `CartDrawerHost` inside `Providers`)

**Interfaces:**

- Consumes: `useCart()`, `IconButton`, `Button`, `PriceEth`, `TrashIcon`, `ArrowLeftIcon`, `EmptyState`.
- Produces: `<CartDrawer />` (client; reads `isOpen` from the store; renders nothing when closed), `<CartDrawerHost />` (client; `next/dynamic(() => import('./CartDrawer'), { ssr: false })` so the drawer bundle loads after hydration), `<QuantityStepper quantity onIncrement onDecrement itemName />`, `<CartItemRow item />`, `<CartSummary total onFinish completed />`.

- [ ] **Step 1: Failing test**

`src/components/cart/CartDrawer/CartDrawer.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { selectCartItems, selectCheckoutCompleted } from '@/features/cart/cartSelectors';
import { selectIsCartOpen } from '@/features/ui/uiSlice';
import { CartDrawer } from './CartDrawer';

const items = [
  {
    id: '2',
    name: 'Lanterna Espectral',
    description: 'd',
    image: '/images/item-02.webp',
    price: 12,
    quantity: 1,
  },
  {
    id: '8',
    name: 'Maça Solar',
    description: 'd',
    image: '/images/item-08.webp',
    price: 32,
    quantity: 1,
  },
];
const openState = { cart: { items, checkoutCompleted: false }, ui: { isCartOpen: true } };

describe('CartDrawer', () => {
  it('renders nothing when closed', () => {
    renderWithProviders(<CartDrawer />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lists items, total and closes with the back button or Escape', async () => {
    const { store } = renderWithProviders(<CartDrawer />, { preloadedState: openState });
    const dialog = screen.getByRole('dialog', { name: 'Mochila de Compras' });
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(2);
    expect(within(dialog).getByText('44 ETH')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar carrinho' }));
    expect(selectIsCartOpen(store.getState())).toBe(false);
  });

  it('changes quantities and removes items', async () => {
    const { store } = renderWithProviders(<CartDrawer />, { preloadedState: openState });
    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar quantidade de Lanterna Espectral' }),
    );
    expect(screen.getByText('56 ETH')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Diminuir quantidade de Lanterna Espectral' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remover Maça Solar' }));
    expect(selectCartItems(store.getState()).map((i) => i.id)).toEqual(['2']);
  });

  it('finalizes the purchase', async () => {
    const { store } = renderWithProviders(<CartDrawer />, { preloadedState: openState });
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar compra' }));
    expect(selectCheckoutCompleted(store.getState())).toBe(true);
    expect(screen.getByRole('button', { name: 'Compra finalizada!' })).toBeDisabled();
    expect(screen.getByText('Seu carrinho está vazio')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const { store } = renderWithProviders(<CartDrawer />, { preloadedState: openState });
    await userEvent.keyboard('{Escape}');
    expect(selectIsCartOpen(store.getState())).toBe(false);
  });
});
```

Run: `npm test -- CartDrawer` → FAIL.

- [ ] **Step 2: Implement the pieces**

`QuantityStepper.tsx`:

```tsx
'use client';

import styles from './QuantityStepper.module.scss';

interface Props {
  quantity: number;
  itemName: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityStepper({ quantity, itemName, onIncrement, onDecrement }: Props) {
  return (
    <div className={styles.stepper} role="group" aria-label={`Quantidade de ${itemName}`}>
      <button
        type="button"
        className={styles.control}
        onClick={onDecrement}
        aria-label={`Diminuir quantidade de ${itemName}`}
      >
        −
      </button>
      <span className={styles.value} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={styles.control}
        onClick={onIncrement}
        aria-label={`Aumentar quantidade de ${itemName}`}
      >
        +
      </button>
    </div>
  );
}
```

SCSS: `.stepper { display: inline-flex; align-items: center; border: 1px solid var(--color-surface-alt); border-radius: var(--radius); background: var(--color-surface-alt); overflow: hidden; } .control { width: 32px; height: 32px; display: grid; place-items: center; color: var(--color-text-muted); @include focus-ring; &:hover { color: var(--color-text); } } .value { min-width: 28px; text-align: center; font-size: var(--fs-sm); font-weight: 600; }`.

`CartItemRow.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { PriceEth } from '@/components/ui/PriceEth/PriceEth';
import { QuantityStepper } from '@/components/cart/QuantityStepper/QuantityStepper';
import type { CartItem } from '@/features/cart/cartSlice';
import { useCart } from '@/features/cart/useCart';
import styles from './CartItemRow.module.scss';

export function CartItemRow({ item }: { item: CartItem }) {
  const { increment, decrement, remove } = useCart();
  return (
    <motion.li
      layout
      className={styles.row}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.thumbnail}>
        <Image src={item.image} alt="" fill sizes="80px" className={styles.image} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>
        <PriceEth value={item.price} />
        <QuantityStepper
          quantity={item.quantity}
          itemName={item.name}
          onIncrement={() => increment(item.id)}
          onDecrement={() => decrement(item.id)}
        />
      </div>
      <IconButton
        label={`Remover ${item.name}`}
        variant="primary"
        size={36}
        onClick={() => remove(item.id)}
        className={styles.remove}
      >
        <TrashIcon size={18} />
      </IconButton>
    </motion.li>
  );
}
```

SCSS: `.row { display: grid; grid-template-columns: 80px 1fr auto; gap: var(--space-4); align-items: end; background: var(--color-surface); border-radius: var(--radius); padding: var(--space-4); margin-bottom: var(--space-4); } .thumbnail { position: relative; width: 80px; aspect-ratio: 1; border-radius: var(--radius); background: var(--color-background); overflow: hidden; align-self: start; } .image { object-fit: contain; padding: 8%; } .info { display: flex; flex-direction: column; gap: var(--space-2); } .title { text-transform: uppercase; font-size: var(--fs-sm); font-weight: 600; } .description { font-size: var(--fs-xs); color: var(--color-text-muted); }`.

`CartSummary.tsx`:

```tsx
'use client';

import { Button } from '@/components/ui/Button/Button';
import { PriceEth } from '@/components/ui/PriceEth/PriceEth';
import styles from './CartSummary.module.scss';

interface Props {
  total: number;
  completed: boolean;
  disabled: boolean;
  onFinish: () => void;
}

export function CartSummary({ total, completed, disabled, onFinish }: Props) {
  return (
    <div className={styles.summary}>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <PriceEth value={total} size="lg" />
      </div>
      <Button fullWidth onClick={onFinish} disabled={disabled || completed}>
        {completed ? 'Compra finalizada!' : 'Finalizar compra'}
      </Button>
    </div>
  );
}
```

SCSS: `.summary { display: flex; flex-direction: column; gap: var(--space-5); padding-top: var(--space-5); } .totalRow { display: flex; justify-content: space-between; align-items: center; } .totalLabel { text-transform: uppercase; font-weight: 600; font-size: var(--fs-lg); }`.

`CartDrawer.tsx`:

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';
import { CartItemRow } from '@/components/cart/CartItemRow/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary/CartSummary';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { useCart } from '@/features/cart/useCart';
import styles from './CartDrawer.module.scss';

export function CartDrawer() {
  const { items, total, isOpen, close, checkoutCompleted, finishCheckout } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div key="cart-drawer" className={styles.root}>
          <motion.button
            type="button"
            className={styles.backdrop}
            aria-label="Fechar carrinho"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            tabIndex={-1}
          />
          <motion.aside
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <header className={styles.header}>
              <IconButton
                ref={closeButtonRef}
                label="Fechar carrinho"
                variant="surface"
                size={44}
                onClick={close}
              >
                <ArrowLeftIcon size={20} />
              </IconButton>
              <h2 id="cart-drawer-title" className={styles.title}>
                Mochila de Compras
              </h2>
            </header>
            <div className={styles.content}>
              {items.length === 0 ? (
                <EmptyState
                  title="Seu carrinho está vazio"
                  description="Adicione itens para continuar."
                />
              ) : (
                <ul className={styles.list}>
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItemRow key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            <CartSummary
              total={total}
              completed={checkoutCompleted}
              disabled={items.length === 0}
              onFinish={finishCheckout}
            />
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CartDrawer;
```

`IconButton` must therefore `forwardRef<HTMLButtonElement>` — update Task 9's `IconButton.tsx` accordingly (`export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(...)`).

SCSS: `.root { position: fixed; inset: 0; z-index: 50; } .backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); width: 100%; } .panel { position: absolute; top: 0; right: 0; height: 100%; width: min(100%, 520px); background: var(--color-background); display: flex; flex-direction: column; padding: var(--space-6); box-shadow: -8px 0 32px rgba(0,0,0,0.4); } .header { display: flex; align-items: center; gap: var(--space-5); margin-bottom: var(--space-7); } .title { font-size: var(--fs-lg); font-weight: 500; } .content { flex: 1; overflow-y: auto; }`.

The backdrop has two `Fechar carrinho` labels (backdrop + back button); tests use `getByRole('button', { name: 'Fechar carrinho' })` which would find two — so give the backdrop `aria-hidden="true"` and no `aria-label` instead (it is a pointer-only affordance; keyboard users have the back button and Escape). Update the JSX: `<motion.button type="button" className={styles.backdrop} onClick={close} aria-hidden="true" tabIndex={-1} />`.

`CartDrawerHost.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';

// Loaded after hydration; the drawer is not needed for first paint (README: importação dinâmica).
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });

export function CartDrawerHost() {
  return <CartDrawer />;
}
```

In `layout.tsx`, render `<CartDrawerHost />` right after `<Footer />` inside `Providers`.

- [ ] **Step 3: Verify and commit**

`npm test` → pass. In the browser: bag button opens the drawer sliding from the right with backdrop; rows match `docs/design/03-cart-overlay.png` (thumbnail, uppercase title, muted description, ETH price, stepper, orange trash); `TOTAL` sums; `FINALIZAR COMPRA` → `COMPRA FINALIZADA!` and the list empties; reload keeps items (persisted); Escape/back/backdrop close; focus returns to the bag button. `npm run lint && npm run typecheck && npm run format:check && npm run build`.

```bash
git add src/components/cart src/components/ui/IconButton src/app/layout.tsx
git commit -m "feat: add cart drawer with quantity stepper, removal, total and checkout

The drawer is loaded with next/dynamic after hydration and animated with
Framer Motion (slide-in panel, item enter/exit)."
```

---

### Task 15: Motion polish: page transitions, reduced motion, add-to-cart feedback

**Files:**

- Create: `src/app/template.tsx`
- Modify: `src/app/providers.tsx` (`MotionConfig`), `src/components/product/ProductCard/ProductCard.tsx` (button label crossfade), `src/components/cart/CartButton/CartButton.tsx` (bag pulse on count change)

**Interfaces:**

- Consumes: `framer-motion` `MotionConfig`, `AnimatePresence`, `motion`.

- [ ] **Step 1: Page transitions via `template.tsx`**

`src/app/template.tsx` (remounts on every navigation, unlike `layout.tsx`):

```tsx
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Respect `prefers-reduced-motion`**

In `providers.tsx` wrap children: `<MotionConfig reducedMotion="user">…</MotionConfig>` (import from `framer-motion`). Combined with the CSS reset rule, users with reduced motion get instant transitions.

- [ ] **Step 3: Add-to-cart feedback**

In `ProductCard`, wrap the button label so it crossfades:

```tsx
<Button fullWidth onClick={() => add(product)} aria-pressed={inCart}>
  <AnimatePresence mode="wait" initial={false}>
    <motion.span
      key={inCart ? 'added' : 'buy'}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
    >
      {inCart ? 'Adicionado ao carrinho' : 'Comprar'}
    </motion.span>
  </AnimatePresence>
</Button>
```

In `CartButton`, animate the bag on count change: wrap `BagIcon` in `<motion.span key={count} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3 }} className={styles.iconWrap}>`.

- [ ] **Step 4: Verify and commit**

`npm test` → pass (accessible names unchanged). Browser: navigating home ↔ detail fades/slides in; hover on cards lifts them, buttons scale; adding an item crossfades the label and pulses the bag; with macOS "Reduce motion" enabled, animations are instant. `npm run lint && npm run typecheck && npm run format:check`.

```bash
git add src/app/template.tsx src/app/providers.tsx src/components/product/ProductCard src/components/cart/CartButton
git commit -m "feat: add page transitions, reduced-motion support and cart feedback animations"
```

---

### Task 16: SEO, accessibility audit, Lighthouse

**Files:**

- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.alt.txt` (optional), `public/favicon.ico` (keep scaffold's)
- Modify: `src/app/layout.tsx` (metadata: `keywords`, `openGraph.locale`, `twitter`), any component flagged by the audit

**Interfaces:**

- Consumes: `products` fixture for sitemap entries (until a real API exists).

- [ ] **Step 1: Sitemap and robots**

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { products } from '@/mocks/fixtures/products';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...products.map((p) => ({
      url: `${BASE_URL}/products/${p.id}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${base}/sitemap.xml` };
}
```

Extend root `metadata`: `keywords: ['NFT', 'marketplace', 'ETH', 'Starsoft']`, `openGraph: { locale: 'pt_BR', siteName: 'Starsoft NFT Marketplace', type: 'website' }`, `twitter: { card: 'summary_large_image' }`, `robots: { index: true, follow: true }`. Add `NEXT_PUBLIC_SITE_URL` to `.env.example` (commented, optional).

- [ ] **Step 2: Accessibility checklist (fix anything failing)**

- Exactly one `h1` per page (home: add a visually-hidden `<h1>Starsoft NFT Marketplace</h1>` at the top of `ProductList`'s section and change the `h2` `Produtos` to remain `h2`).
- Every image has alt (`ProductCard`: product name; `CartItemRow`: `""` because the title is adjacent).
- All icon buttons have `aria-label`; the stepper is a labelled `group`; the drawer is `role="dialog" aria-modal aria-labelledby`.
- Colour contrast: `#CCCCCC` on `#232323` ≈ 10:1, white on `#FF8310` ≈ 2.6:1 for the button label — **below AA for small text.** Keep the design colour but set button label `font-size: var(--fs-sm)` bold uppercase and add `text-shadow: 0 1px 1px rgba(0,0,0,0.25)`; document in README as a design-driven exception. (Do not change the orange; fidelity wins.)
- Focus visible on every interactive element (mixin `focus-ring`).
- `eslint-plugin-jsx-a11y` (bundled in `eslint-config-next`) reports zero warnings.

- [ ] **Step 3: Lighthouse**

```bash
npm run build && (npm start & sleep 5; npx --yes lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new" --output=json --output-path=./lighthouse.json --quiet; kill %1)
node -e "const r=require('./lighthouse.json').categories;for(const k in r)console.log(k,Math.round(r[k].score*100))"
```

Expected: accessibility ≥ 95, SEO ≥ 95, best-practices ≥ 90, performance ≥ 85 (local). Fix regressions (usually image `sizes`, missing `priority`, or unlabeled controls). Add `lighthouse.json` to `.gitignore`.

- [ ] **Step 4: Verify and commit**

`npm test && npm run lint && npm run typecheck && npm run format:check`.

```bash
git add src/app .env.example .gitignore src/components
git commit -m "feat: add sitemap, robots, richer metadata and accessibility fixes"
```

---

### Task 17: Docker and Docker Compose (single-command startup)

**Files:**

- Create: `Dockerfile`, `docker-compose.yml`, `.dockerignore`

**Interfaces:**

- Produces: `docker compose up` (and `docker-compose up`) serving the production build on `http://localhost:3000`; `docker compose --profile dev up web-dev` for hot-reload development on `http://localhost:3001`.

- [ ] **Step 1: `.dockerignore`**

```
node_modules
.next
.git
docs
coverage
lighthouse.json
*.md
!README.md
.env*.local
```

- [ ] **Step 2: Multi-stage `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_MOCKING=enabled
ARG NEXT_PUBLIC_API_BASE_URL=https://starsoft-challenge-7dfd4a56a575.herokuapp.com/v1
ENV NEXT_PUBLIC_API_MOCKING=$NEXT_PUBLIC_API_MOCKING \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: `docker-compose.yml`**

```yaml
services:
  web:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_MOCKING: ${NEXT_PUBLIC_API_MOCKING:-enabled}
        NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-https://starsoft-challenge-7dfd4a56a575.herokuapp.com/v1}
    image: starsoft-nft-marketplace
    ports:
      - '3000:3000'
    environment:
      NEXT_PUBLIC_API_MOCKING: ${NEXT_PUBLIC_API_MOCKING:-enabled}
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-https://starsoft-challenge-7dfd4a56a575.herokuapp.com/v1}
    restart: unless-stopped

  web-dev:
    profiles: ['dev']
    image: node:22-alpine
    working_dir: /app
    command: sh -c "npm ci && npm run dev -- --hostname 0.0.0.0"
    volumes:
      - .:/app
      - node_modules_dev:/app/node_modules
    ports:
      - '3001:3000'
    environment:
      NEXT_PUBLIC_API_MOCKING: enabled
      WATCHPACK_POLLING: 'true'

volumes:
  node_modules_dev:
```

- [ ] **Step 4: Verify**

```bash
docker compose build --no-cache web && docker compose up -d web && sleep 6
curl -s localhost:3000 | grep -c "Cajado Estelar"      # ≥ 1: SSR through MSW inside the container
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/products/2   # 200
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/mockServiceWorker.js  # 200
docker compose logs web | grep -c "server-side mocking enabled"      # 1
docker compose down
```

Also `docker-compose up` (hyphenated alias) must work if installed. Then `docker compose --profile dev up web-dev` → `http://localhost:3001` hot-reloads on file edits (spot check, then `docker compose --profile dev down`).

- [ ] **Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "build: add multi-stage Dockerfile and docker-compose for one-command startup"
```

---
