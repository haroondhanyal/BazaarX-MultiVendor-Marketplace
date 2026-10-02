# Development boundaries

## Workspace ownership for parallel work

Six contributors can work with these folder boundaries:

1. Buyer experience: `apps/web/src/views` and buyer-only components.
2. Seller experience: `apps/seller`.
3. Admin experience: `apps/admin`.
4. API and data: `apps/api` and `apps/api/prisma`.
5. Shared contracts and validation: `packages/types` and `packages/validation`.
6. Shared UI, infrastructure, and integration: `packages/ui`, `infrastructure`, and `docs`.

Agree on shared types and endpoint shapes before parallel work touches the same flow. Keep page-level actions in their page/store and move a helper into a shared package only when more than one app needs it.

## Current mock boundary

The buyer cart, wishlist, customer session, saved addresses, order history, support tickets, returns, notifications, and chat use browser local storage for this phase. The catalog uses `apps/web/src/services/catalog.ts`: it reads the local seed list by default and can call `/api/v1/catalog` when `VITE_API_URL` is set. Checkout and mock payment can also use the API when `VITE_API_URL` is set. The Nest API currently exposes health, mock auth, catalog, checkout, payments, and inventory; API orders and payment records live in memory. Seller and admin operational surfaces currently use browser mock data. Authentication is for UI demonstration only; it does not create real credentials or tokens.

Each role has its own route table and page folder. The seller workspace page (`apps/seller/src/views/SellerToolsPage.vue`) and admin workspace page (`apps/admin/src/views/AdminToolsPage.vue`) render the separate finance, marketing, risk, operations, reporting, and settings routes from typed per-screen data. Actions update local demo state; report actions download CSV files. Buyer support and after-sales screens each have their own view under `apps/web/src/views`.

## Local commands

- `npm run dev`: buyer marketplace
- `npm run dev:seller`: seller portal shell
- `npm run dev:admin`: admin portal shell
- `npm run dev:api`: NestJS API
- `npm run type-check`: strict checks for all workspaces
- `npm run build`: production builds for all workspaces
- `docker compose -f infrastructure/docker-compose.yml up -d`: PostgreSQL, Redis, and MinIO
