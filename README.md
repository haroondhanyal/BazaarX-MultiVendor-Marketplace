<p align="center">
  <img src="apps/web/public/assets/branding/bazaarx-logo.svg" alt="BazaarX — Shop smarter. Live better." width="420" />
</p>

<p align="center"><strong>Shop smarter. Live better.</strong><br />A multi-vendor marketplace for shoppers, independent sellers, and marketplace teams.</p>

<br />

BazaarX is a multi-vendor commerce platform for shoppers, independent sellers, and marketplace administrators. The first delivery is a responsive web MVP: buyers can discover products, save favorites, manage a cart, place a mock order, and view order history; sellers can review sales, manage listings and inventory, and fulfil orders; administrators can review marketplace activity, sellers, products, orders, and payments.

The experience follows the approved BazaarX direction: white surfaces, orange actions, navy type, rounded cards, restrained shadows, responsive layouts, and one shared SVG wordmark. The code is organized as a small monorepo so six developers can work across buyer web, seller portal, admin portal, API, shared types/validation, and infrastructure without crowding one application folder.

## Product areas

- **Buyer marketplace** — home and category discovery, search, product details, wishlist, cart, sign-in/sign-up, account, checkout, payment selection, card demo, order confirmation, and order details.
- **Seller center** — demo sign-in and onboarding, dashboard, product list, create/edit product, stock management, order list, and fulfilment detail.
- **Admin portal** — demo sign-in, marketplace dashboard, seller approval, product moderation, orders, and payment records.
- **API foundation** — NestJS health, catalog, mock authentication, checkout, payment, and inventory endpoints, with request validation and Swagger documentation.
- **Data model foundation** — Prisma schema and initial SQL migration for users, seller stores, catalog, inventory, carts, wishlists, orders, payment records, and status history.

## Phase delivery

- **Phase 0 — foundation:** workspace, role app shells, shared packages, design tokens, responsive layout foundations, local infrastructure configuration, API shell, and BazaarX logo.
- **Phase 1 — buyer identity:** mock customer login/signup and account basics; seller/admin demo logins.
- **Phase 2 — marketplace discovery:** home, search/category results, product details, wishlist, and cart.
- **Phase 3 — seller operations MVP:** onboarding demo, seller dashboard, products, add/edit product, inventory, orders, and fulfilment.
- **Phase 4 — admin operations MVP:** dashboard, seller review, product moderation, order oversight, and payments.
- **Phase 5 — buyer purchase MVP:** checkout, address/delivery choices, voucher, payment selection/card demo, order confirmation, and order details/history.

## Run locally

Use Node.js 20+ and npm 10+.

```sh
npm install
npm run dev          # buyer app at http://localhost:5173
npm run dev:seller   # seller center at http://localhost:5174
npm run dev:admin    # admin portal at http://localhost:5175
npm run dev:api      # API at http://localhost:3001/api/v1
```

The buyer app uses browser local storage for its demo flow by default. Set `VITE_API_URL=http://localhost:3001/api/v1` in the web app environment to use the mock API for checkout and payments. API catalog records and browser demo products are seeded separately for this phase. API orders, payments, and inventory are held in memory, so they reset when the API restarts. The SQL migration is provided, but a database-backed repository and real payment, shipping, and identity providers are future work.

Demo checkout voucher: `BAZAARX10` (10% off, PKR 10,000 minimum subtotal, up to PKR 5,000 discount).

See [development notes](docs/development.md) for the team folder boundaries and local setup details. Configure local secrets using `.env.example`; do not commit credentials.
