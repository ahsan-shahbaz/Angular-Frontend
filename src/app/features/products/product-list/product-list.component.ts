import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Product } from '../../../core/models/product.model';
import { selectAllProducts, selectProductLoading, selectProductError } from '../../../core/state/product.selectors';
import { loadProducts, searchProducts } from '../../../core/state/product.actions';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SkeletonCardComponent } from '../../../shared/components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="product-list-container">
      <header class="list-header">
        <div class="header-content">
          <h1 *ngIf="!searchQuery">Our Collection</h1>
          <h1 *ngIf="searchQuery">Search Results</h1>
          <p *ngIf="!searchQuery">Discover our range of premium products curated just for you.</p>
          <p *ngIf="searchQuery">
            Showing results for "<strong>{{ searchQuery }}</strong>"
          </p>
        </div>
        
        <div class="filter-bar">
          <div class="stats" *ngIf="(products$ | async) as products">
            {{ products.length }} items shown
          </div>
        </div>
      </header>

      <!-- Error State -->
      <div class="error-state" *ngIf="error$ | async as error">
        <div class="error-card">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ef4444"/>
          </svg>
          <h2>Unable to load products</h2>
          <p>{{ error }}</p>
          <button (click)="retry()">Try Again</button>
        </div>
      </div>

      <!-- Skeleton Loading State -->
      <div class="product-grid" *ngIf="loading$ | async">
        <app-skeleton-card *ngFor="let i of [1,2,3,4,5,6,7,8]"></app-skeleton-card>
      </div>

      <!-- Product Grid -->
      <div class="product-grid" *ngIf="!(loading$ | async) && (products$ | async) as products">
        <app-product-card 
          *ngFor="let product of products" 
          [product]="product">
        </app-product-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!(loading$ | async) && (products$ | async)?.length === 0">
        <div class="empty-card">
          <span class="empty-icon">🔍</span>
          <h3 *ngIf="searchQuery">No products found for "{{ searchQuery }}"</h3>
          <h3 *ngIf="!searchQuery">No products found</h3>
          <p>Try adjusting your search or browse our full collection.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-list-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .list-header {
      margin-bottom: 3rem;
    }
    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-main, #1e293b);
      margin-bottom: 0.5rem;
    }
    .header-content p {
      color: var(--text-muted, #64748b);
      font-size: 1.125rem;
    }
    .header-content p strong {
      color: var(--text-main, #1e293b);
    }
    .filter-bar {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      justify-content: flex-end;
      color: var(--text-muted, #94a3b8);
      font-size: 0.875rem;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    .error-state, .empty-state {
      display: flex;
      justify-content: center;
      padding: 4rem 0;
      text-align: center;
    }
    .error-card {
      background: var(--card-bg, white);
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      max-width: 400px;
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .error-card h2 { color: var(--text-main, #1e293b); margin: 1rem 0; }
    .error-card p { color: var(--text-muted, #64748b); margin-bottom: 2rem; }
    .error-card button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }

    .empty-card {
      background: var(--card-bg, white);
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      max-width: 400px;
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .empty-card h3 {
      color: var(--text-main, #1e293b);
      margin: 0 0 0.5rem;
      font-weight: 700;
    }
    .empty-card p {
      color: var(--text-muted, #64748b);
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .product-list-container { padding: 1rem; }
      .header-content h1 { font-size: 2rem; }
      .product-grid { gap: 1rem; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  loading$: Observable<boolean> = this.store.select(selectProductLoading);
  error$: Observable<string | null> = this.store.select(selectProductError);

  searchQuery: string | null = null;

  ngOnInit() {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const query = params['search']?.trim();
      this.searchQuery = query || null;

      if (query) {
        this.store.dispatch(searchProducts({ query }));
      } else {
        this.store.dispatch(loadProducts());
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry() {
    if (this.searchQuery) {
      this.store.dispatch(searchProducts({ query: this.searchQuery }));
    } else {
      this.store.dispatch(loadProducts());
    }
  }
}
