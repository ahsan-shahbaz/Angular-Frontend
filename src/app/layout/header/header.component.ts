import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="header">
      <div class="nav-brand" routerLink="/">
        StorePOC
      </div>

      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchInput($event)"
          (keydown.enter)="submitSearch()"
        >
        <button class="search-clear" *ngIf="searchQuery" (click)="clearSearch()">✕</button>
      </div>

      <nav class="nav-links">
        <a routerLink="/products" routerLinkActive="active">Products</a>
      </nav>

      <div class="nav-actions">
        <button class="theme-toggle" (click)="themeService.toggleTheme()" title="Toggle Theme">
          {{ (themeService.isDarkMode$ | async) ? '🌙' : '☀️' }}
        </button>

        <a routerLink="/wishlist" class="cart-link" title="Wishlist">
          ❤️ <span class="badge" *ngIf="wishlistService.wishlistCount() > 0">{{ wishlistService.wishlistCount() }}</span>
        </a>

        <a routerLink="/cart" class="cart-link" title="Cart">
          🛒 <span class="badge" *ngIf="cartItemCount$ | async as count">{{ count }}</span>
        </a>

        <ng-container *ngIf="authService.currentUser$ | async as user; else loginLink">
          <div class="user-menu">
            <span>Hi, {{ user.firstName }}</span>
            <button class="logout-btn" (click)="authService.logout()">Logout</button>
          </div>
        </ng-container>
        <ng-template #loginLink>
          <a routerLink="/login" class="login-link">Login</a>
        </ng-template>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--header-bg, #ffffff);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
      gap: 1rem;
    }
    .nav-brand {
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
      color: var(--text-color, #1f2937);
      white-space: nowrap;
    }

    /* Search */
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 420px;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--text-muted, #94a3b8);
      pointer-events: none;
    }
    .search-box input {
      width: 100%;
      padding: 0.6rem 2.2rem 0.6rem 2.5rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 10px;
      background: var(--surface-section, #f8fafc);
      color: var(--text-color, #1f2937);
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    .search-box input:focus {
      border-color: var(--primary-400, #60a5fa);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .search-box input::placeholder {
      color: var(--text-muted, #94a3b8);
    }
    .search-clear {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      font-size: 0.8rem;
      padding: 4px;
      line-height: 1;
    }
    .search-clear:hover { color: var(--text-color, #1f2937); }

    .nav-links a, .login-link {
      text-decoration: none;
      color: var(--text-color, #4b5563);
      font-weight: 500;
      margin: 0 1rem;
    }
    .nav-links .active {
      color: #3b82f6;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .cart-link {
      position: relative;
      text-decoration: none;
      font-size: 1.25rem;
    }
    .badge {
      position: absolute;
      top: -8px;
      right: -10px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .theme-toggle, .logout-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-color, #4b5563);
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--text-color, #4b5563);
    }
    
    :host-context(.dark-theme) .header {
      --header-bg: #1f2937;
      --text-color: #f9fafb;
    }

    @media (max-width: 768px) {
      .search-box { max-width: 200px; }
      .nav-links { display: none; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = '';
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  cartItemCount$ = this.cartService.cartState$.pipe(
    map(state => state.totalQuantity)
  );

  ngOnInit() {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.navigateSearch(query);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string) {
    this.searchSubject$.next(value);
  }

  submitSearch() {
    this.navigateSearch(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.router.navigate(['/products']);
  }

  private navigateSearch(query: string) {
    const trimmed = query.trim();
    if (trimmed) {
      this.router.navigate(['/products'], { queryParams: { search: trimmed } });
    } else {
      this.router.navigate(['/products']);
    }
  }
}
