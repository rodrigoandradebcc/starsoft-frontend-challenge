# Starsoft NFT Marketplace — Live API Design

## Context

This document amends the implementation plan in
`docs/superpowers/plans/2026-09-03-starsoft-nft-marketplace.md`. The original plan assumed that
the challenge API was unavailable and proposed MSW fixtures. On September 3, 2026, the current
Starsoft host was verified as operational.

The application will therefore consume the live API instead of mocking product data. All other
product, visual, testing, accessibility, Docker, and documentation requirements from the existing
plan remain in scope.

## API contract

- Base URL: `https://api-challenge.starsoft.games/api/v1`
- Product listing: `GET /products`
- Required query parameters: `page`, `rows`, `sortBy`, and `orderBy`
- Default request: `page=1&rows=8&sortBy=id&orderBy=ASC`
- Observed response envelope: `{ products: Product[], count: number }`
- Observed product fields: `id`, `name`, `description`, `image`, `price`, and `createdAt`
- `price` is returned as a decimal string and must be normalized to a number at the service
  boundary.

The Swagger page is reachable, but its embedded server URL points to a removed Heroku app. The
application must not use that obsolete URL.

## Architecture

`productsService` is the only layer aware of the external contract. It validates and normalizes
the live response into the internal typed model used by React Query and components. Pagination
metadata is derived from `count`, the requested page, and row count. This keeps the UI independent
from transport details and limits future API changes to one module.

Server-rendered pages prefetch data through TanStack Query and hydrate client components. Product
listing uses `useInfiniteQuery` and accumulates pages for “Carregar mais”. Redux Toolkit owns cart
and drawer state, while cart persistence starts only after browser hydration.

The environment variable `NEXT_PUBLIC_API_BASE_URL` defaults to the current Starsoft URL. No MSW
worker, mock handlers, fixtures, or screenshot-derived product artwork will ship in the app.

## Product details

Before implementing `/products/[id]`, the live API will be checked for a product-detail endpoint.
If `GET /products/:id` is supported, the service will use it. Otherwise, the service will resolve a
product from the paginated listing behind the same `getById` interface. The route renders explicit
loading, error, and not-found states in either case.

## Images and security

Product images come from the API and render through `next/image`. `next.config.ts` will allow only
the image host observed in the API response (`softstar.s3.amazonaws.com`) using a narrow remote
pattern. Components provide meaningful alternative text and retain a styled fallback when an image
cannot load.

## Error handling

The HTTP client throws a typed error containing status and a safe message. Data-fetching surfaces
show Portuguese loading, empty, error, and retry states. Network failures do not clear the cart.
Malformed products are rejected or normalized at the service boundary rather than leaking invalid
values into rendering and totals.

## Testing and verification

Unit tests mock `fetch` at the HTTP boundary; they do not contact the live service. Tests cover
response normalization, pagination derivation, price conversion, HTTP failures, cart reducers,
persistence, components, and critical interactions. A separate non-mutating integration check may
exercise the live listing endpoint during development, but it is not part of the deterministic test
suite.

Each implementation task must pass the relevant Jest tests plus lint, type checking, formatting,
and production build checks. Final visual verification uses the screenshots and design tokens in
`docs/design/`.

## Plan changes

- Remove the original MSW, fixture, service-worker, instrumentation, and image-extraction tasks.
- Replace them with a live API service and contract-normalization tests.
- Update environment files, Docker configuration, and README examples to use the current API URL.
- Configure `next/image` for the API image host.
- Keep the remaining task sequence and acceptance criteria from the existing implementation plan.

## Explicit visual decisions

- The home frame is authoritative: both “COMPRAR” and “ADICIONADO AO CARRINHO” use the orange
  primary button style.
- The product-detail page reuses established card tokens in a responsive two-column layout because
  no dedicated detail frame was supplied.
