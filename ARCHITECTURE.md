# Architecture Overview

This document provides a high-level architecture diagram of the Angular e-commerce application using Mermaid diagrams.

## Context Diagram

```mermaid
graph LR
    user["End User"] -->|Uses| angularApp["Angular Frontend (SPA)"]
    angularApp -->|HTTP| api["Backend API"]
    angularApp -->|Auth via OAuth/JWT| authServer["Authentication Server"]
``` 

## Container Diagram

```mermaid
graph TD
    subgraph Angular Frontend
        bootstrap[bootstrapApplication + app.config.ts]
        appComponent[AppComponent (standalone)]
        layout[LayoutComponent]
        routes[Lazy Routes (home, products, cart, checkout, wishlist, auth)]
        store[NgRx Store (cart, products)]
        interceptors[HTTP interceptors]
    end

    bootstrap --> appComponent --> layout --> routes
    bootstrap --> store
    bootstrap --> interceptors
    store --> routes
    interceptors --> api["Backend API"]
```

## Feature Relationships

```mermaid
flowchart LR
    subgraph Core Services
        authService[AuthService]
        cartService[CartService]
        productService[ProductService]
        wishlistService[WishlistService]
        themeService[ThemeService]
        toastService[ToastService]
        recentlyService[RecentlyViewedService]
    end
    subgraph State
        cartState[Cart reducer + effects]
        productState[Product reducer + effects]
    end
    subgraph Features
        home[Home Component]
        products[Product List / Details]
        cart[Cart Component]
        checkout[Checkout Component]
        auth[Login Component]
        wishlist[Wishlist Component]
    end
    subgraph Shared UI
        button[Button]
        input[Input]
        loading[Loading Skeleton]
        modal[Modal]
        toast[Toast]
    end
    productService --> productState
    cartService --> cartState
    authService --> auth
    wishlistService --> wishlist
    recentlyService --> home
    cartState --> cart
    productState --> products
    home --> button
    products --> button
    products --> loading
    cart --> modal
    checkout --> input
    auth --> input
    wishlist --> button
    toastService --> toast
    themeService --> home
```

> 🔧 You can preview these diagrams with the Mermaid previewer in VS Code or online tools. Adjust as needed to capture additional details.
