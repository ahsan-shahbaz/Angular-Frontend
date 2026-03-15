import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { Product } from '../../../core/models/product.model';
import { ProductFilters } from '../../../core/models/product-filters.model';
import { selectAllProducts, selectProductError, selectProductFilters, selectProductLoading } from '../../../core/state/product.selectors';
import { loadProducts, resetFilters, updateFilters } from '../../../core/state/product.actions';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SkeletonCardComponent } from '../../../shared/components/skeleton-card/skeleton-card.component';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="page">

      <!-- Hero Header -->
      <header class="hero">
        <h1>Our Collection</h1>
        <p>Discover premium products curated just for you.</p>
      </header>

      <!-- Filter Toolbar -->
      <section class="toolbar" *ngIf="filterModel as f">
        <div class="filters-row">

          <!-- Price -->
          <div class="field">
            <label>Price</label>
            <div class="price-pair">
              <input type="number" placeholder="Min $" [ngModel]="f.priceMin" (ngModelChange)="updateNumericFilter('priceMin', $event)">
              <span class="sep">–</span>
              <input type="number" placeholder="Max $" [ngModel]="f.priceMax" (ngModelChange)="updateNumericFilter('priceMax', $event)">
            </div>
          </div>

          <!-- Category -->
          <div class="field">
            <label>Category</label>
            <select [ngModel]="f.category" (ngModelChange)="updateTextFilter('category', $event)">
              <option [ngValue]="null">All</option>
              <option *ngFor="let c of (categories$ | async)" [value]="c">{{ c }}</option>
            </select>
          </div>

          <!-- Brand -->
          <div class="field">
            <label>Brand</label>
            <select [ngModel]="f.brand" (ngModelChange)="updateTextFilter('brand', $event)">
              <option [ngValue]="null">All</option>
              <option *ngFor="let b of (brands$ | async)" [value]="b">{{ b }}</option>
            </select>
          </div>

          <!-- Rating -->
          <div class="field">
            <label>Rating</label>
            <select [ngModel]="f.rating" (ngModelChange)="updateNumericFilter('rating', $event)">
              <option [ngValue]="null">Any</option>
              <option *ngFor="let r of ratingOptions" [ngValue]="r">{{ r }}★ & up</option>
            </select>
          </div>

          <!-- In Stock -->
          <label class="toggle">
            <input type="checkbox" [ngModel]="f.inStockOnly" (ngModelChange)="updateStock($event)">
            <span class="toggle-label">In stock only</span>
          </label>

          <!-- Actions -->
          <div class="actions">
            <button class="btn-apply" (click)="applyFilters()">Apply</button>
            <button class="btn-clear" (click)="clearFilters()" [disabled]="!hasActiveFilters(f)">Clear</button>
          </div>
        </div>

        <div class="results-count" *ngIf="(products$ | async) as prods">
          <span class="count-badge">{{ prods.length }}</span> products found
        </div>
      </section>

      <!-- Error -->
      <div class="state-msg" *ngIf="error$ | async as error">
        <div class="state-card">
          <span class="state-icon">⚠️</span>
          <h3>Unable to load products</h3>
          <p>{{ error }}</p>
          <button class="btn-apply" (click)="retry()">Try Again</button>
        </div>
      </div>

      <!-- Skeleton -->
      <div class="grid" *ngIf="loading$ | async">
        <app-skeleton-card *ngFor="let i of [1,2,3,4,5,6,7,8]"></app-skeleton-card>
      </div>

      <!-- Products -->
      <div class="grid" *ngIf="!(loading$ | async) && (products$ | async) as products">
        <app-product-card *ngFor="let product of products" [product]="product"></app-product-card>
      </div>

      <!-- Empty -->
      <div class="state-msg" *ngIf="!(loading$ | async) && (products$ | async)?.length === 0">
        <div class="state-card">
          <span class="state-icon">🔍</span>
          <h3>No products found</h3>
          <p>Try adjusting your filters.</p>
          <button class="btn-apply" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ─── Page ─── */
    .page {
      max-width: 1360px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }

    /* ─── Hero ─── */
    .hero {
      text-align: center;
      margin-bottom: 2rem;
    }
    .hero h1 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-main);
      margin: 0 0 0.4rem;
    }
    .hero p {
      color: var(--text-muted);
      font-size: 1.05rem;
      margin: 0;
    }

    /* ─── Toolbar ─── */
    .toolbar {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 140px;
      flex: 1;
    }
    .field label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .field select,
    .field input {
      appearance: none;
      -webkit-appearance: none;
      background: var(--surface-section);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0.6rem 0.8rem;
      font-size: 0.88rem;
      color: var(--text-main);
      width: 100%;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      font-family: inherit;
    }
    .field select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2rem;
    }
    .field select:focus,
    .field input:focus {
      border-color: var(--primary-400);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
    }

    /* Price pair */
    .price-pair {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .price-pair input { min-width: 0; }
    .sep {
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Toggle */
    .toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
      padding-bottom: 0.1rem;
      white-space: nowrap;
    }
    .toggle input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      cursor: pointer;
    }
    .toggle-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }

    /* Action buttons */
    .actions {
      display: flex;
      gap: 0.5rem;
      padding-bottom: 0.1rem;
    }

    .btn-apply {
      background: var(--primary-color);
      color: var(--primary-color-text);
      border: none;
      padding: 0.6rem 1.4rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    .btn-apply:hover {
      background: var(--primary-700);
      transform: translateY(-1px);
    }

    .btn-clear {
      background: var(--surface-hover);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-clear:hover:not(:disabled) { background: var(--surface-200); }
    .btn-clear:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Results badge */
    .results-count {
      font-size: 0.82rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-100);
      color: var(--primary-700);
      font-weight: 700;
      font-size: 0.75rem;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      border-radius: 20px;
    }

    /* ─── Grid ─── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    /* ─── State Messages ─── */
    .state-msg {
      display: flex;
      justify-content: center;
      padding: 5rem 1rem;
    }
    .state-card {
      text-align: center;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 3rem;
      max-width: 380px;
    }
    .state-icon { font-size: 2.5rem; display: block; margin-bottom: 1rem; }
    .state-card h3 {
      margin: 0 0 0.5rem;
      color: var(--text-main);
      font-weight: 700;
    }
    .state-card p {
      color: var(--text-muted);
      margin: 0 0 1.5rem;
      line-height: 1.5;
    }

    /* ─── Mobile ─── */
    @media (max-width: 640px) {
      .page { padding: 1rem; }
      .toolbar { padding: 1rem; border-radius: 12px; }
      .filters-row { flex-direction: column; }
      .field { min-width: 0; }
      .grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  loading$: Observable<boolean> = this.store.select(selectProductLoading);
  error$: Observable<string | null> = this.store.select(selectProductError);
  filters$: Observable<ProductFilters> = this.store.select(selectProductFilters);
  categories$ = this.productService.getCategories().pipe(shareReplay(1));
  brands$ = this.products$.pipe(
    map(products => Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort()),
    shareReplay(1)
  );

  filterModel: ProductFilters = {
    priceMin: null,
    priceMax: null,
    category: null,
    brand: null,
    rating: null,
    inStockOnly: false
  };

  ratingOptions = [5, 4, 3, 2, 1];

  ngOnInit() {
    this.filters$.pipe(take(1)).subscribe((filters) => {
      const queryFilters = this.parseFiltersFromQuery();
      const normalized = this.normalizeFilters({ ...filters, ...queryFilters });
      this.filterModel = { ...normalized };
      this.store.dispatch(updateFilters({ filters: normalized }));
      this.syncQueryParams(normalized);
    });
  }

  retry() {
    this.store.dispatch(loadProducts());
  }

  updateNumericFilter(key: 'priceMin' | 'priceMax' | 'rating', value: any) {
    const parsed = value === null || value === '' ? null : Number(value);
    const numericValue = parsed === null || Number.isNaN(parsed) ? null : parsed;
    this.filterModel = { ...this.filterModel, [key]: numericValue } as ProductFilters;
  }

  updateTextFilter(key: 'category' | 'brand', value: string) {
    this.filterModel = { ...this.filterModel, [key]: value || null };
  }

  updateStock(inStock: boolean) {
    this.filterModel = { ...this.filterModel, inStockOnly: inStock };
  }

  applyFilters() {
    const normalized = this.normalizeFilters(this.filterModel);
    this.filterModel = { ...normalized };
    this.store.dispatch(updateFilters({ filters: normalized }));
    this.syncQueryParams(normalized);
  }

  clearFilters() {
    this.filterModel = {
      priceMin: null,
      priceMax: null,
      category: null,
      brand: null,
      rating: null,
      inStockOnly: false
    };
    this.store.dispatch(resetFilters());
    this.syncQueryParams(this.filterModel);
  }

  hasActiveFilters(filters: ProductFilters): boolean {
    return Boolean(
      filters.priceMin !== null ||
      filters.priceMax !== null ||
      filters.category ||
      filters.brand ||
      filters.rating !== null ||
      filters.inStockOnly
    );
  }

  private syncQueryParams(filters: ProductFilters) {
    const queryParams: Record<string, string> = {};

    if (filters.priceMin !== null) {
      queryParams['priceMin'] = String(filters.priceMin);
    }
    if (filters.priceMax !== null) {
      queryParams['priceMax'] = String(filters.priceMax);
    }
    if (filters.category) {
      queryParams['category'] = filters.category;
    }
    if (filters.brand) {
      queryParams['brand'] = filters.brand;
    }
    if (filters.rating !== null) {
      queryParams['rating'] = String(filters.rating);
    }
    if (filters.inStockOnly) {
      queryParams['inStock'] = 'true';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  private parseFiltersFromQuery(): Partial<ProductFilters> {
    const params = this.route.snapshot.queryParamMap;
    const filters: Partial<ProductFilters> = {};

    const priceMin = params.get('priceMin');
    const priceMax = params.get('priceMax');
    const category = params.get('category');
    const brand = params.get('brand');
    const rating = params.get('rating');
    const inStock = params.get('inStock');

    if (priceMin !== null && !isNaN(Number(priceMin))) {
      filters.priceMin = Number(priceMin);
    }
    if (priceMax !== null && !isNaN(Number(priceMax))) {
      filters.priceMax = Number(priceMax);
    }
    if (category) {
      filters.category = category;
    }
    if (brand) {
      filters.brand = brand;
    }
    if (rating !== null && !isNaN(Number(rating))) {
      filters.rating = Number(rating);
    }
    if (inStock !== null) {
      filters.inStockOnly = inStock === 'true';
    }

    return filters;
  }

  private normalizeFilters(filters: ProductFilters): ProductFilters {
    return {
      priceMin: filters.priceMin !== null && filters.priceMin !== undefined ? Number(filters.priceMin) : null,
      priceMax: filters.priceMax !== null && filters.priceMax !== undefined ? Number(filters.priceMax) : null,
      category: filters.category ? filters.category : null,
      brand: filters.brand ? filters.brand : null,
      rating: filters.rating !== null && filters.rating !== undefined ? Number(filters.rating) : null,
      inStockOnly: filters.inStockOnly
    };
  }
}
