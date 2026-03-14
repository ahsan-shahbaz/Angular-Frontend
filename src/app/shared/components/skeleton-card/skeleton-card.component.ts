import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-price"></div>
        <div class="skeleton-rating"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: #f0f0f0;
      border-radius: 12px;
      overflow: hidden;
      height: 380px;
      display: flex;
      flex-direction: column;
      animation: pulse 1.5s infinite ease-in-out;
    }
    .skeleton-image {
      flex: 1;
      background: #e0e0e0;
    }
    .skeleton-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .skeleton-title {
      height: 1.25rem;
      background: #e0e0e0;
      width: 80%;
      border-radius: 4px;
    }
    .skeleton-price {
      height: 1rem;
      background: #e0e0e0;
      width: 40%;
      border-radius: 4px;
    }
    .skeleton-rating {
      height: 0.75rem;
      background: #e0e0e0;
      width: 60%;
      border-radius: 4px;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `]
})
export class SkeletonCardComponent {}
