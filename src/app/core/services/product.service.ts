import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ProductFilters } from '../models/product-filters.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // RxJS ShareReplay Cache
  private productsCache = new Map<string, Observable<Product[]>>();
  private categoriesCache$?: Observable<string[]>;
  private productCache = new Map<number, Observable<Product>>();
  private searchCache = new Map<string, Observable<Product[]>>();

  getProducts(filters?: ProductFilters): Observable<Product[]> {
    const params = this.buildFilterParams(filters);
    const cacheKey = params.toString() || 'all';
    const cached = this.productsCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const request$ = this.http.get<Product[]>(`${this.apiUrl}/products`, { params }).pipe(
      shareReplay(1)
    );

    this.productsCache.set(cacheKey, request$);
    return request$;
  }

  getProduct(id: number): Observable<Product> {
    const cached = this.productCache.get(id);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      shareReplay(1)
    );

    this.productCache.set(id, request$);
    return request$;
  }

  searchProducts(query: string): Observable<Product[]> {
    const key = query.trim().toLowerCase();
    const cached = this.searchCache.get(key);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<Product[]>(`${this.apiUrl}/products/search`, {
      params: { q: query }
    }).pipe(shareReplay(1));

    this.searchCache.set(key, request$);
    return request$;
  }

  getCategories(): Observable<string[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get<string[]>(`${this.apiUrl}/products/categories`).pipe(
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured`);
  }

  private buildFilterParams(filters?: ProductFilters): HttpParams {
    let params = new HttpParams();

    if (!filters) {
      return params;
    }

    if (filters.priceMin != null) {
      params = params.set('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax != null) {
      params = params.set('priceMax', filters.priceMax.toString());
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.brand) {
      params = params.set('brand', filters.brand);
    }
    if (filters.rating != null) {
      params = params.set('rating', filters.rating.toString());
    }
    if (filters.inStockOnly) {
      params = params.set('inStock', 'true');
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    return params;
  }
}
