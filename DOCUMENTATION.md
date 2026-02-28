# Angular E-commerce Frontend Documentation

This document describes the Angular-based e-commerce frontend in this workspace. It has been updated to reflect the current project layout, features, and developer workflow (snapshot date: March 1, 2026).

---

## 📦 Project Summary

- **Framework:** Angular (project uses Angular CLI configuration in this repo).
- **Styling / UI:** PrimeNG + `styles.scss` / `styles.css` with custom theme files under `src/styles/themes/`.
- **Language:** TypeScript
- **Purpose:** A lightweight e-commerce frontend demo showing product browsing, product details, cart, wishlist, checkout flow, and simple client-side state management.

This repository contains the frontend only. Replace or extend services to integrate real backend APIs as needed.

---

## 🗂 Workspace Structure (high level)

```
angular.json
package.json
README.md
DOCUMENTATION.md   <- updated file
src/
   index.html
   main.ts
   styles.css / styles.scss
   app/
      app.component.ts
      app.config.ts
      app.routes.ts
      core/
         enums/
         guards/
         interceptors/
         models/
         services/
         state/
      features/
         auth/
         cart/
         checkout/
         home/
         products/
         wishlist/
      layout/
      shared/
   assets/
   environments/
   styles/
```

Refer to the code for exact file names and locations; the structure above reflects the main modules and feature areas present in the workspace.

---

## 🔌 Application Bootstrap & Routing

- `src/main.ts` bootstraps `AppModule`.
- Routing is configured in `app.routes.ts` / `AppRoutingModule` to expose primary routes for home, products, cart, checkout, auth, and wishlist. The root route directs users to the `home`/`product-list` views.

---

## 🧱 Key Modules & Features

- **Core (`app/core`)**: cross-cutting concerns — API models, interceptors (`auth.interceptor.ts`, `error.interceptor.ts`), guards (`auth.guard.ts`), and shared services (`auth.service.ts`, `product.service.ts`, `cart.service.ts`, `wishlist.service.ts`, `toast.service.ts`, `theme.service.ts`, `recently-viewed.service.ts`).
- **Features (`app/features`)**: feature folders contain components and pages:
   - `home` — landing content and featured products.
   - `products` — product list, product card, product details pages.
   - `cart` — shopping cart UI and integration with `CartService` and cart state.
   - `checkout` — simple checkout flow and order submission UI.
   - `auth` — login view (basic demo).
   - `wishlist` — wishlist management.
- **Layout (`app/layout`)**: global header, footer, and layout component managing navigation and layout slots.
- **Shared UI (`app/shared/ui`)**: small reusable components — `button`, `input`, `modal`, `toast`, `loading-skeleton`, etc.

---

## 🧩 Important Components (examples)

- `product-list` / `product-card`: product browsing and card component used across lists.
- `product-details`: detailed product view with add-to-cart / add-to-wishlist actions.
- `cart.component`: cart list, item quantity management, and checkout entry.
- `checkout.component`: collects checkout information and simulates order submission.
- `wishlist.component`: view and manage saved items.

Shared UI components live under `app/shared/ui` and are small, framework-agnostic building blocks.

---

## 🧠 Services & Client Logic

- **Authentication:** `auth.service.ts` provides a simple authentication/identity interface used by `auth.guard.ts` and `auth.interceptor.ts`.
- **Products:** `product.service.ts` exposes product listing and details. Replace with real HTTP endpoints as needed.
- **Cart:** `cart.service.ts` plus state files under `core/state` manage the current user's cart; a lightweight action/effect/reducer pattern for cart is present (`cart.actions.ts`, `cart.effects.ts`, `cart.reducer.ts`, `cart.selectors.ts`).
- **Wishlist / Recently Viewed / Theme / Toast:** small services for cross-cutting features.

Interceptors handle auth token attachment and centralized error handling.

---

## 🔁 State Management

- The repo uses a targeted state approach for the cart via `core/state/` files. This provides selectors, actions, and effects sufficient for optimistic updates and UI synchronization.

If you need full global state scaling, consider introducing NgRx store modules.

---

## 🔐 Guards & Security Hooks

- `auth.guard.ts` protects routes that require login. Update `auth.service` to integrate with a real auth provider and adjust the guard accordingly.

---

## 🛠 Development, Build & Run

- **Install dependencies:**

```bash
npm install
```

- **Run development server:**

```bash
npm start
# or `ng serve` if using Angular CLI directly
```

The workspace includes VS Code tasks for `npm: start` (dev server) and `npm: test` (unit tests).

- **Run tests:**

```bash
npm test
# runs configured unit tests (Karma + Jasmine)
```

- **Build production bundle:**

```bash
ng build --configuration production
```

---

## ✅ VS Code Tasks

- `npm: start` — development server (background task).
- `npm: test` — run unit tests.

Use the VS Code Run/Debug panel or `Run Task` command to run these tasks.

---

## 🔁 Typical Data Flow (Add to Cart)

1. User clicks "Add to cart" in `product-details` or `product-card`.
2. Component calls `CartService.addItem()`.
3. `CartService` updates local state (and optionally persists to localStorage).
4. Cart components subscribe to cart selectors and re-render.

---

## 🧩 Extending & Integration Notes

- Replace service stubs with real `HttpClient` calls to backend endpoints.
- Integrate real authentication (OAuth / JWT) and wire `auth.interceptor.ts` to attach tokens.
- Add server-side pagination and filtering to `product.service` for large catalogs.
- Consider adding e2e tests and CI pipelines for automated checks.

---

## 📚 Coding Guidelines

- Follow Angular style guide for modularity and naming.
- Keep transformation logic in utilities/services; keep components focused on UI.
- Centralize strings and validation rules in constants for easier localization.

---

## 📦 Dependencies (see `package.json` for exact versions)

- `@angular/*`
- `primeng`, `primeicons`
- `rxjs`, `typescript`, `karma`, `jasmine`

---

## 📄 Resources

- [Angular CLI Reference](https://angular.io/cli)
- [PrimeNG Documentation](https://primefaces.org/primeng)
- [Angular Style Guide](https://angular.io/guide/styleguide)

---

*End of documentation (updated March 1, 2026).*
