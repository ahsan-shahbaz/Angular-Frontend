import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // RxJS ShareReplay Cache
  private productsCache$?: Observable<Product[]>;
  private categoriesCache$?: Observable<string[]>;
  private productCache = new Map<number, Observable<Product>>();

  getProducts(): Observable<Product[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
        shareReplay(1)
      );
    }
    return this.productsCache$;
  }

  getProduct(id: number): Observable<Product> {
    const cached = this.productCache.get(id);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      // Cache the latest product response to prevent duplicate network calls
      shareReplay(1)
    );

    this.productCache.set(id, request$);
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

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search`, {
      params: { q: query }
    });
  }
}
