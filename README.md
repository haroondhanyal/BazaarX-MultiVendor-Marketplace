<p align="center">
  <img src="apps/web/public/assets/branding/bazaarx-logo.png" alt="BazaarX logo" width="520" />
</p>

<p align="center"><strong>Shop smarter. Live better.</strong><br />A multi-vendor marketplace for shoppers, independent sellers, and marketplace teams.</p>

<br />

BazaarX is a multi-vendor commerce platform for shoppers, independent sellers, and marketplace administrators. The first delivery is a responsive web MVP: buyers can discover products, save favorites, manage a cart, place a mock order, and view order history; sellers can review sales, manage listings and inventory, and fulfil orders; administrators can review marketplace activity, sellers, products, orders, and payments.

The experience follows the approved BazaarX direction: white surfaces, orange actions, navy type, rounded cards, restrained shadows, responsive layouts, and the BazaarX logo image supplied for this project. The code is organized as a small monorepo so six developers can work across buyer web, seller portal, admin portal, API, shared types/validation, and infrastructure without crowding one application folder.

## Product areas

- **Buyer marketplace** — home and category discovery, search, product details, wishlist, cart, sign-in/sign-up, account, checkout, payment selection, card demo, order confirmation, order history/details/tracking, returns/refunds, notifications, support tickets, and buyer–seller chat.
- **Seller center** — demo sign-in and onboarding, dashboard, product list, create/edit product, stock management, order list and fulfilment, returns, promotions, finance, payouts, analytics, store/account settings, and buyer messages.
- **Admin portal** — demo sign-in and dashboard, user and seller management, seller approval, product moderation, orders, payments, shipments, returns/refunds, promotions, vouchers, flash sales, campaigns, fraud/risk, support tickets, analytics, audit logs, and system settings.
- **API foundation** — NestJS health, catalog, mock authentication, checkout, payment, and inventory endpoints, with request validation and Swagger documentation.
- **Data model foundation** — Prisma schema and initial SQL migration for users, seller stores, catalog, inventory, carts, wishlists, orders, payment records, and status history.

## Phase delivery

- **Phase 0 — foundation:** workspace, role app shells, shared packages, design tokens, responsive layout foundations, local infrastructure configuration, API shell, and BazaarX logo.
- **Phase 1 — buyer identity:** mock customer login/signup and account basics; seller/admin demo logins.
- **Phase 2 — marketplace discovery:** home, search/category results, product details, wishlist, and cart.
- **Phase 3 — seller operations MVP:** seller identity/onboarding, dashboard, products, add/edit product, inventory, orders/fulfilment, returns, promotions, finance/payouts, analytics, store settings, and messages.
- **Phase 4 — admin operations MVP:** dashboard, users/sellers, seller approval, product moderation, order/payment/shipment management, returns/refunds, marketing, fraud/risk, support, analytics, audit logs, and settings.
- **Phase 5 — buyer service and purchase MVP:** checkout, address/delivery choices, voucher, payment selection/card demo, order confirmation/details/history/tracking, return/refund request, notifications, support center, and buyer–seller chat.
- **Phase 6 — delivery and after-sales:** shipment creation, courier scans, buyer tracking timeline, return request evidence, seller/admin review steps, and refund records.
- **Phase 7 — marketplace offers:** server-validated voucher rules, flash-sale stock and prices, campaign submissions, and admin activation controls.
- **Phase 8 — seller finance and analytics:** category commission rules, seller net proceeds, weekly settlement batches, seller performance reports, and marketplace totals.

## Run locally

Use Node.js 20+ and npm 10+.

```sh
npm install
npm run dev          # buyer app at http://localhost:5173
npm run dev:seller   # seller center at http://localhost:5174
npm run dev:admin    # admin portal at http://localhost:5175
npm run dev:api      # API at http://localhost:3001/api/v1
```

Copy `.env.example` to `.env` at the repository root to connect all three portals to the API. The Phase 6–8 API is a process-memory mock for this delivery: orders, shipments, returns, vouchers, campaigns, flash sales, and settlement records reset when the API restarts. The Prisma schema and migration describe the database shape, but these mock endpoints do not persist to PostgreSQL yet.

The buyer app uses browser local storage for its demo flow by default. With the root `.env` configured, checkout and fulfilment-related buyer, seller, and admin screens use the shared mock API. API catalog records and browser demo products are seeded separately. Seller/admin functions outside the Phase 6–8 endpoints and buyer support interactions retain browser-local demo storage. Real payment, shipping, identity providers, and database-backed repositories are future work.

Demo checkout voucher: `BAZAARX10` (10% off, PKR 10,000 minimum subtotal, up to PKR 5,000 discount).

See [development notes](docs/development.md) for the team folder boundaries and local setup details. Configure local secrets using `.env.example`; do not commit credentials.
