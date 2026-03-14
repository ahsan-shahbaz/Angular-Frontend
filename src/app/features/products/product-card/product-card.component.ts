import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { Store } from '@ngrx/store';
import { addToCart } from '../../../core/state/cart.actions';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card">
      <div class="product-image">
        <img [src]="product.image" [alt]="product.title" loading="lazy">
        <div class="product-badge" *ngIf="product.discountPercentage">
          -{{ product.discountPercentage }}%
        </div>
      </div>
      
      <div class="product-info">
        <span class="product-category">{{ product.category }}</span>
        <h3 class="product-title">{{ product.title }}</h3>
        
        <div class="product-rating">
          <span class="stars">★</span>
          <span class="rating-value">{{ product.rating.rate }}</span>
          <span class="rating-count">({{ product.rating.count }})</span>
        </div>
        
        <div class="product-price-row">
          <div class="price-container">
            <span class="current-price">{{ product.price | currency }}</span>
            <span class="original-price" *ngIf="product.originalPrice">
              {{ product.originalPrice | currency }}
            </span>
          </div>
          <button class="add-to-cart" (click)="onAddToCart($event)">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .product-card {
      background: var(--surface-card, #ffffff);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0,0,0,0.05);
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.1);
      border-color: var(--primary-color, #6366f1);
    }
    .product-image {
      position: relative;
      padding-top: 100%;
      background: #f8fafc;
      overflow: hidden;
    }
    .product-image img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 80%;
      object-fit: contain;
      transition: transform 0.5s ease;
    }
    .product-card:hover .product-image img {
      transform: translate(-50%, -50%) scale(1.1);
    }
    .product-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #ef4444;
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .product-info {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .product-category {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .product-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.75rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
      height: 2.8em;
    }
    .product-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: auto;
      padding-bottom: 1rem;
    }
    .stars { color: #f59e0b; }
    .rating-value { font-weight: 600; font-size: 0.875rem; }
    .rating-count { color: #94a3b8; font-size: 0.75rem; }
    
    .product-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }
    .original-price {
      font-size: 0.875rem;
      color: #94a3b8;
      text-decoration: line-through;
      margin-left: 8px;
    }
    .add-to-cart {
      background: #6366f1;
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    .add-to-cart:hover {
      background: #4f46e5;
    }
    .add-to-cart svg { fill: currentColor; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private store = inject(Store);

  onAddToCart(event: Event) {
    event.stopPropagation();
    this.store.dispatch(addToCart({ product: this.product, quantity: 1 }));
  }
}
