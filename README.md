# Angular 16 E-commerce Frontend

This repository contains a standalone Angular 16 e-commerce frontend that uses PrimeNG for UI styling and NgRx for cart/product state.

## Features
- Product catalogue with list/detail views, loading skeletons, and retry handling.
- Cart management backed by NgRx with local storage hydration plus HTTP sync hooks for a backend at `environment.apiUrl`.
- Checkout view protected by `authGuard`, with login/register flows wired to REST endpoints.
- Wishlist powered by Angular signals and persisted to `localStorage`.
- Shared UI elements (buttons, inputs, modals, skeletons, toast notifications) and a simple theme toggle.

## Architecture
- Bootstrapped via `bootstrapApplication` with providers defined in `src/app/app.config.ts` (router, HTTP interceptors, NgRx store/effects, devtools).
- `LayoutComponent` hosts header/footer and lazy-loaded routes for home, products, cart, checkout, wishlist, and auth.
- Store slices: `products` (fetched through `ProductEffects`) and `cart` (reducers/selectors used across the cart/checkout UI).
- Services call REST endpoints under `environment.apiUrl`; wishlist and recently viewed items rely on signals and `localStorage`.

## Getting Started
1. Install Node.js 18+ and Angular CLI 16+ (if you want to use `ng` directly).
2. Install dependencies: `npm install`
3. Run the dev server: `npm start` and open `http://localhost:4200`.
4. Build for production: `npm run build` (outputs to `dist/frontend`).

## Configuration
- API base URL and feature flags live in `src/environments/environment.ts` (default: `http://localhost:8080/api`).
- Global styling and theming tokens are defined in `src/styles.scss` and `src/styles/` overrides.

## Testing
Karma + Jasmine are configured, but no spec files exist yet. Running `npm test -- --watch=false` currently reports missing inputs until tests are added.
