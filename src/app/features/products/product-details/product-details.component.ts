import { Component, ChangeDetectionStrategy, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingSkeletonComponent, ProductCardComponent],
  template: `
    <div class="details-wrapper" *ngIf="product$ | async as product; else loading">
      
      <!-- Breadcrumbs -->
      <nav class="breadcrumb">
        <a (click)="goBack()">Products</a>
        <span class="separator">/</span>
        <span class="current">{{ product.category }}</span>
        <span class="separator">/</span>
        <span class="current">{{ product.brand }}</span>
      </nav>

      <div class="details-page">
        <!-- Image Section -->
        <div class="image-section">
          <div class="main-image-container">
             <span class="discount-badge" *ngIf="product.discountPercentage">-{{ product.discountPercentage }}%</span>
             <img [src]="activeImage$ | async" [alt]="product.title" class="main-image">
          </div>
          <div class="thumbnail-gallery" *ngIf="product.images.length > 1">
             <div class="thumbnail" 
                  *ngFor="let img of product.images" 
                  [class.active]="(activeImage$ | async) === img"
                  (click)="setActiveImage(img)">
                <img [src]="img" alt="Thumbnail">
             </div>
          </div>
        </div>
        
        <!-- Info Section -->
        <div class="product-info">
          <div class="header-info">
            <h2 class="brand-name">{{ product.brand }}</h2>
            <h1 class="product-title">{{ product.title }}</h1>
            
            <div class="rating-stock-row">
               <div class="rating-badge">
                 <span class="stars">★★★★★</span>
                 <span class="score">{{ product.rating.rate }}</span>
                 <span class="count">({{ product.rating.count }} reviews)</span>
               </div>
               <div class="stock-status" [ngClass]="product.stock > 0 ? 'in-stock' : 'out-of-stock'">
                 <span class="dot"></span>
                 {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
               </div>

               <button class="wishlist-btn" 
                       [class.active]="wishlistService.isInWishlist(product.id)" 
                       (click)="wishlistService.toggleWishlist(product)"
                       title="Toggle Wishlist">
                  <i class="pi" [ngClass]="wishlistService.isInWishlist(product.id) ? 'pi-heart-fill' : 'pi-heart'"></i>
               </button>
            </div>
          </div>

          <div class="price-container">
            <div class="price-info">
               <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
               <span class="original-price" *ngIf="product.originalPrice">\${{ product.originalPrice | number:'1.2-2' }}</span>
            </div>
            <div class="savings-tag" *ngIf="product.originalPrice">
              Save \${{ (product.originalPrice - product.price) | number:'1.2-2' }}
            </div>
          </div>

          <!-- Variants Selection -->
          <div class="variants-section" *ngIf="product.variants && product.variants.length > 0">
             <div class="variant-group" *ngFor="let variant of product.variants">
                <h3 class="variant-label">Select {{ variant.type }}</h3>
                <div class="variant-options">
                   <button *ngFor="let option of variant.options" 
                           class="option-btn"
                           [class.selected]="(selection$ | async)?.[variant.type] === option"
                           (click)="selectVariant(variant.type, option)">
                      {{ option }}
                   </button>
                </div>
             </div>
          </div>
          
          <div class="purchase-actions" *ngIf="quantity$ | async as qty">
            <div class="qty-selector">
               <button class="qty-action" [disabled]="qty <= 1" (click)="updateQuantity(qty - 1)">-</button>
               <span class="qty-display">{{ qty }}</span>
               <button class="qty-action" [disabled]="qty >= product.stock" (click)="updateQuantity(qty + 1)">+</button>
            </div>
            <app-button size="lg" (onClick)="addToCart(product, qty)" class="add-to-cart-btn" [disabled]="product.stock === 0">
              <span class="btn-inner">🛒 Add to Cart</span>
            </app-button>
          </div>

          <div class="benefits-grid">
             <div class="benefit-item">
                <span class="benefit-icon">🚚</span>
                <span class="benefit-text">Free Shipping</span>
             </div>
             <div class="benefit-item">
                <span class="benefit-icon">🛡️</span>
                <span class="benefit-text">Secure Payment</span>
             </div>
             <div class="benefit-item">
                <span class="benefit-icon">🔄</span>
                <span class="benefit-text">30-Day Returns</span>
             </div>
          </div>

          <div class="product-description">
            <h3 class="desc-heading">Description</h3>
            <p class="desc-content" [innerHTML]="sanitizedDescription"></p>
            
            <div class="product-tags">
               <span class="tag-pill" *ngFor="let tag of product.tags">#{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="related-section" *ngIf="relatedProducts$ | async as relatedProducts">
        <h2 class="section-title">Similar Products</h2>
        <div class="products-grid">
           <app-product-card *ngFor="let rel of relatedProducts" [product]="rel"></app-product-card>
        </div>
      </div>
      
    </div>

    <ng-template #loading>
       <div class="details-wrapper">
         <div class="details-page">
           <div class="image-section">
             <div class="main-image-container">
               <app-loading-skeleton class="large-skeleton"></app-loading-skeleton>
             </div>
           </div>
           <div class="product-info">
              <app-loading-skeleton></app-loading-skeleton>
              <br>
              <app-loading-skeleton></app-loading-skeleton>
              <br>
              <app-loading-skeleton></app-loading-skeleton>
           </div>
         </div>
       </div>
    </ng-template>
  `,
  styles: [`
    .details-wrapper {
      max-width: 1300px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .breadcrumb {
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #64748b;
    }
    .breadcrumb a { cursor: pointer; color: #6366f1; transition: color 0.2s; }
    .breadcrumb a:hover { color: #4f46e5; text-decoration: underline; }
    .breadcrumb .separator { opacity: 0.5; }

    .details-page {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 5rem;
      align-items: start;
    }
    
    /* Image Gallery */
    .image-section { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 100px; }
    .main-image-container {
      background: #ffffff;
      padding: 4rem;
      border-radius: 32px;
      border: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 600px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
    }
    .main-image { max-width: 100%; max-height: 100%; object-fit: contain; }
    .discount-badge {
      position: absolute; top: 24px; left: 24px;
      background: #ef4444; color: white; padding: 8px 16px;
      border-radius: 12px; font-weight: 800; font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    .thumbnail-gallery { display: flex; gap: 1rem; overflow-x: auto; padding: 0.5rem 0; }
    .thumbnail {
      flex: 0 0 100px; height: 100px;
      background: white;
      border: 2px solid #f1f5f9;
      border-radius: 16px;
      padding: 0.75rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .thumbnail img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .thumbnail.active { border-color: #6366f1; transform: translateY(-4px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15); }
    .thumbnail:hover:not(.active) { border-color: #cbd5e1; }

    /* Product Info */
    .product-info { display: flex; flex-direction: column; }
    .brand-name { color: #6366f1; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.75rem; }
    .product-title { font-size: 3rem; line-height: 1.1; font-weight: 900; margin-bottom: 1.5rem; color: #0f172a; letter-spacing: -0.02em; }
    
    .rating-stock-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
    .rating-badge { display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; padding: 6px 12px; border-radius: 100px; border: 1px solid #f1f5f9; }
    .stars { color: #fbbf24; font-size: 1.1rem; }
    .score { font-weight: 700; color: #0f172a; }
    .count { color: #64748b; font-size: 0.85rem; }
    
    .stock-status { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .in-stock { color: #10b981; }
    .in-stock .dot { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
    .out-of-stock { color: #ef4444; }
    .out-of-stock .dot { background: #ef4444; }

    .wishlist-btn { margin-left: auto; background: white; border: 1px solid #e2e8f0; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; color: #64748b; }
    .wishlist-btn:hover { border-color: #fca5a5; color: #ef4444; transform: scale(1.1); }
    .wishlist-btn.active { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

    /* Price */
    .price-container { margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .price-info { display: flex; align-items: baseline; gap: 1rem; }
    .current-price { font-size: 3.5rem; font-weight: 900; color: #0f172a; margin: 0; }
    .original-price { font-size: 1.5rem; color: #94a3b8; text-decoration: line-through; }
    .savings-tag { color: #10b981; font-weight: 700; font-size: 0.9rem; background: #ecfdf5; padding: 4px 12px; border-radius: 6px; align-self: flex-start; }

    /* Variants */
    .variants-section { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 3rem; }
    .variant-label { font-size: 0.9rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
    .variant-options { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .option-btn { min-width: 60px; height: 44px; padding: 0 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #0f172a; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .option-btn:hover { border-color: #6366f1; }
    .option-btn.selected { border-color: #6366f1; background: #f5f7ff; color: #6366f1; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15); }

    /* Actions */
    .purchase-actions { display: flex; gap: 1.5rem; margin-bottom: 3rem; }
    .qty-selector { display: flex; align-items: center; background: #f1f5f9; border-radius: 16px; padding: 6px; }
    .qty-action { width: 40px; height: 40px; border-radius: 12px; border: none; background: #ffffff; color: #0f172a; font-size: 1.2rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .qty-action:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .qty-action:disabled { opacity: 0.5; cursor: not-allowed; }
    .qty-display { width: 50px; text-align: center; font-weight: 800; color: #0f172a; font-size: 1.1rem; }
    .add-to-cart-btn { flex: 1; }
    ::ng-deep .add-to-cart-btn button { height: 56px !important; border-radius: 16px !important; font-size: 1.1rem !important; background: #0f172a !important; }
    .btn-inner { display: flex; align-items: center; justify-content: center; gap: 0.75rem; font-weight: 700; }

    /* Benefits */
    .benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 1.5rem; background: #f8fafc; border-radius: 24px; margin-bottom: 3rem; border: 1px solid #f1f5f9; }
    .benefit-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; }
    .benefit-icon { font-size: 1.5rem; }
    .benefit-text { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Description */
    .product-description { display: flex; flex-direction: column; gap: 1.5rem; }
    .desc-heading { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
    .desc-content { color: #475569; line-height: 1.7; font-size: 1.1rem; }
    .product-tags { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .tag-pill { background: #f1f5f9; color: #64748b; padding: 6px 14px; border-radius: 100px; font-size: 0.85rem; font-weight: 600; }

    /* Related Products */
    .related-section { margin-top: 6rem; padding-top: 4rem; border-top: 1px solid #f1f5f9; }
    .section-title { font-size: 2.25rem; font-weight: 900; margin-bottom: 3rem; color: #0f172a; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2.5rem; }

    .large-skeleton { height: 600px; width: 100%; border-radius: 32px; }

    /* Dark Theme */
    :host-context(.dark-theme) {
      .product-title, .current-price, .score, .variant-label, .qty-display, .desc-heading, .section-title { color: #f8fafc; }
      .main-image-container { background: #1e293b; border-color: #334155; }
      .thumbnail { background: #1e293b; border-color: #334155; }
      .rating-badge { background: #1e293b; border-color: #334155; }
      .qty-selector { background: #1e293b; }
      .qty-action { background: #334155; color: #f8fafc; }
      .benefits-grid { background: #0f172a; border-color: #1e293b; }
      .benefit-text { color: #94a3b8; }
      .desc-content { color: #cbd5e1; }
      .option-btn { background: #1e293b; border-color: #334155; color: #f8fafc; }
      .tag-pill { background: #1e293b; color: #94a3b8; }
      .wishlist-btn { background: #1e293b; border-color: #334155; }
    }

    @media (max-width: 1024px) {
      .details-page { grid-template-columns: 1fr; gap: 3rem; }
      .product-title { font-size: 2.5rem; }
      .main-image-container { height: 400px; padding: 2rem; }
      .image-section { position: static; }
    }

    @media (max-width: 640px) {
      .purchase-actions { flex-direction: column; }
      .qty-selector { width: 100%; justify-content: center; }
      .benefits-grid { grid-template-columns: 1fr; text-align: left; }
      .benefit-item { flex-direction: row; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent implements OnInit {
  @Input() id!: string; 
  
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public wishlistService = inject(WishlistService);
  private recentService = inject(RecentlyViewedService);
  private router = inject(Router);
  private titleService = inject(Title);

  product$!: Observable<Product>;
  relatedProducts$!: Observable<Product[]>;
  
  private activeImageSubject = new BehaviorSubject<string>('');
  activeImage$ = this.activeImageSubject.asObservable();

  private quantitySubject = new BehaviorSubject<number>(1);
  quantity$ = this.quantitySubject.asObservable();

  private selectionSubject = new BehaviorSubject<{ [key: string]: string }>({});
  selection$ = this.selectionSubject.asObservable();

  sanitizedDescription: SafeHtml = '';
  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.product$ = this.productService.getProduct(Number(this.id)).pipe(
      map(p => {
        if (p && !p.variants) {
          // Add mock variants if backend doesn't provide them
          const mockVariants = [
            { type: 'Size', options: ['S', 'M', 'L', 'XL'] },
            { type: 'Color', options: ['Black', 'Navy', 'Grey'] }
          ];
          
          // Pre-select first options
          const initialSelection: { [key: string]: string } = {};
          mockVariants.forEach(v => initialSelection[v.type] = v.options[0]);
          this.selectionSubject.next(initialSelection);
          
          return { ...p, variants: mockVariants };
        }
        return p;
      }),
      tap(p => {
        if (p) {
          this.titleService.setTitle(`${p.title} - Ahsan Shop`);
          
          if (p.images && p.images.length > 0) {
            this.activeImageSubject.next(p.images[0]);
          } else if (p.image) {
            this.activeImageSubject.next(p.image);
          }

          this.sanitizedDescription = this.sanitizer.bypassSecurityTrustHtml(p.description);
          this.recentService.addViewedProduct(p);
        }
      })
    );
    
    this.relatedProducts$ = this.product$.pipe(
      switchMap(p => p ? this.productService.getProducts().pipe(
        map(prods => prods.filter(prod => prod.category === p.category && prod.id !== p.id).slice(0, 4))
      ) : of([]))
    );
  }

  setActiveImage(img: string) {
    this.activeImageSubject.next(img);
  }

  updateQuantity(newQty: number) {
    this.quantitySubject.next(newQty);
  }

  selectVariant(type: string, option: string) {
    const current = this.selectionSubject.value;
    this.selectionSubject.next({ ...current, [type]: option });
  }

  addToCart(product: any, qty: number) {
    if (product) {
      const selectedVariants = this.selectionSubject.value;
      // Combine product with selected variants for cart info
      const productWithVariants = { 
        ...product, 
        selectedVariants 
      };
      this.cartService.addToCart(productWithVariants, qty);
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
