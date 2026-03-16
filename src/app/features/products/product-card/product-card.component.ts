import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { Store } from '@ngrx/store';
import { addToCart } from '../../../core/state/cart.actions';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card" role="button" tabindex="0"
         (click)="goToDetails()"
         (keydown.enter)="goToDetails()"
         (keydown.space)="goToDetails()">

      <!-- Image Area -->
      <div class="card-img">
        <img [src]="product.image" [alt]="product.title" loading="lazy">
        <span class="badge" *ngIf="product.discountPercentage">
          -{{ product.discountPercentage }}%
        </span>
        <button class="cart-fab" (click)="onAddToCart($event)" title="Add to Cart">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>

      <!-- Info Area -->
      <div class="card-body">
        <span class="category">{{ product.category }}</span>
        <h3 class="title">{{ product.title }}</h3>

        <div class="rating">
          <div class="stars-track">
            <span class="stars-bg">★★★★★</span>
            <span class="stars-fg" [style.width.%]="(product.rating.rate / 5) * 100">★★★★★</span>
          </div>
          <span class="review-count">{{ product.rating.count }}</span>
        </div>

        <div class="price-row">
          <div class="prices">
            <span class="price">{{ product.price | currency }}</span>
            <span class="was" *ngIf="product.originalPrice">{{ product.originalPrice | currency }}</span>
          </div>
          <span class="stock-tag" *ngIf="product.stock > 0">In Stock</span>
          <span class="stock-tag out" *ngIf="product.stock === 0">Out of Stock</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ─── Host ─── */
    :host { display: block; height: 100%; }

    /* ─── Card Shell ─── */
    .card {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--card-bg);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: transform 0.35s cubic-bezier(.22,1,.36,1),
                  box-shadow 0.35s cubic-bezier(.22,1,.36,1),
                  border-color 0.35s ease;
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 48px -12px rgba(0,0,0,.12);
      border-color: var(--primary-200);
    }

    /* ─── Image ─── */
    .card-img {
      position: relative;
      aspect-ratio: 4 / 3;
      background: var(--img-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow: hidden;
    }
    .card-img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.5s cubic-bezier(.22,1,.36,1);
    }
    .card:hover .card-img img { transform: scale(1.08); }

    /* Badge */
    .badge {
      position: absolute;
      top: 14px;
      left: 14px;
      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      letter-spacing: 0.02em;
      box-shadow: 0 4px 8px rgba(255,65,108,.25);
    }

    /* Cart FAB */
    .cart-fab {
      position: absolute;
      bottom: 14px;
      right: 14px;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: var(--primary-color);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.3s, transform 0.3s, background 0.2s;
      box-shadow: 0 4px 12px rgba(59,130,246,.3);
    }
    .card:hover .cart-fab {
      opacity: 1;
      transform: translateY(0);
    }
    .cart-fab:hover {
      background: var(--primary-700);
    }

    /* ─── Body ─── */
    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 1.25rem 1.25rem 1.4rem;
    }

    .category {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--primary-color);
    }

    .title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ─── Rating ─── */
    .rating {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: auto;
      padding-top: 0.5rem;
    }
    .stars-track {
      position: relative;
      font-size: 0.8rem;
      color: var(--surface-300);
      line-height: 1;
    }
    .stars-fg {
      position: absolute;
      top: 0; left: 0;
      color: #f59e0b;
      overflow: hidden;
      white-space: nowrap;
    }
    .review-count {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* ─── Price Row ─── */
    .price-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
      padding-top: 0.6rem;
      border-top: 1px solid var(--border-color);
      margin-top: 0.6rem;
    }
    .prices { display: flex; align-items: baseline; gap: 6px; }
    .price {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .was {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }
    .stock-tag {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--green-500);
    }
    .stock-tag.out { color: var(--red-500); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private store = inject(Store);
  private router = inject(Router);

  onAddToCart(event: Event) {
    event.stopPropagation();
    this.store.dispatch(addToCart({ product: this.product, quantity: 1 }));
  }

  goToDetails() {
    this.router.navigate(['/products', this.product.id]);
  }
}
