import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="card" [routerLink]="['/products', product.id]">
      <div class="badge-container">
         <span class="discount-badge" *ngIf="product.discountPercentage">-{{ product.discountPercentage }}%</span>
      </div>
      
      <div class="img-container">
        <img [src]="product.image" [alt]="product.title" loading="lazy" />
        
        <button class="wishlist-btn" 
                [class.active]="isFavorite()" 
                (click)="toggleWishlist($event)"
                [title]="isFavorite() ? 'Remove from Wishlist' : 'Add to Wishlist'">
           <i class="pi" [ngClass]="isFavorite() ? 'pi-heart-fill' : 'pi-heart'"></i>
        </button>

        <div class="overlay-actions">
           <button class="quick-view">Quick View</button>
        </div>
      </div>

      <div class="content">
        <p class="brand">{{ product.brand }}</p>
        <h3 class="title" [title]="product.title">
          {{ product.title | slice:0:45 }}{{ product.title.length > 45 ? '...' : '' }}
        </h3>
        
        <div class="rating-box">
           <span class="stars">★★★★★</span>
           <span class="rating-score" [style.width.%]="(product.rating.rate / 5) * 100">★★★★★</span>
           <span class="count">({{ product.rating.count }})</span>
        </div>
        
        <div class="footer">
          <div class="price-container">
            <span class="price">\${{ product.price | number:'1.2-2' }}</span>
            <span class="original-price" *ngIf="product.originalPrice">\${{ product.originalPrice | number:'1.2-2' }}</span>
          </div>
          <button class="icon-cart-btn" (click)="onAddToCart($event)" title="Add to Cart">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
             </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 16px;
      overflow: hidden;
      background: var(--card-bg, #ffffff);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      cursor: pointer;
    }
    .card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
      border-color: transparent;
    }
    .badge-container {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 10;
    }
    .discount-badge {
      background: #ef4444;
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
    }
    .img-container {
      height: 240px;
      padding: 2rem;
      background: var(--img-bg, #f9fafb);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .img-container img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
      transition: transform 0.5s;
    }
    .card:hover .img-container img {
      transform: scale(1.05);
    }
    .wishlist-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      color: #9ca3af;
      transition: all 0.2s;
      z-index: 10;
    }
    .wishlist-btn:hover {
      transform: scale(1.1);
      color: #ef4444;
    }
    .wishlist-btn.active {
      color: #ef4444;
      background: #fee2e2;
    }
    .overlay-actions {
      position: absolute;
      bottom: -40px;
      left: 0; right: 0;
      display: flex;
      justify-content: center;
      transition: bottom 0.3s;
    }
    .card:hover .overlay-actions {
      bottom: 20px;
    }
    .quick-view {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(4px);
      border: none;
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.875rem;
      color: #111827;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .card:hover .quick-view { opacity: 1; }

    .content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .brand {
      color: #6366f1;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0 0 0.5rem 0;
    }
    .title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
      color: var(--text-color, #1f2937);
      line-height: 1.4;
    }
    .rating-box {
      margin-bottom: 1.25rem;
      position: relative;
      display: inline-block;
      color: #e5e7eb;
      font-size: 1rem;
    }
    .rating-score {
      color: #fbbf24;
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      white-space: nowrap;
    }
    .count {
      color: #9ca3af;
      font-size: 0.875rem;
      margin-left: 8px;
    }

    .footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price-container {
      display: flex;
      flex-direction: column;
    }
    .price {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-color, #111827);
    }
    .original-price {
      font-size: 0.875rem;
      color: #9ca3af;
      text-decoration: line-through;
      margin-top: 2px;
    }
    .icon-cart-btn {
      background: var(--text-color, #111827);
      color: var(--card-bg, #ffffff);
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    .icon-cart-btn:hover {
      transform: scale(1.1);
      background: #3b82f6;
    }

    :host-context(.dark-theme) .card {
      --card-bg: #1f2937;
      --border-color: #374151;
      --text-color: #f9fafb;
      --img-bg: #374151;
    }
    :host-context(.dark-theme) .img-container img {
      mix-blend-mode: normal;
      background: white;
      border-radius: 8px;
      padding: 10px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private cartService = inject(CartService);
  public wishlistService = inject(WishlistService);

  isFavorite() {
     return this.wishlistService.isInWishlist(this.product.id);
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.toggleWishlist(this.product);
  }

  onAddToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(this.product);
  }
}
