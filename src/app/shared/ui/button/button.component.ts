import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="'btn ' + variant + ' ' + size"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)">
      <span *ngIf="loading" class="spinner"></span>
      <ng-content *ngIf="!loading"></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      gap: 0.5rem;
      letter-spacing: 0.02em;
    }
    .primary { 
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      color: white; 
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }
    .primary:hover:not(:disabled) { 
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
    }
    .secondary { 
      background: var(--surface-200); 
      color: var(--text-main); 
    }
    .secondary:hover:not(:disabled) { 
      background: var(--surface-300);
      transform: translateY(-2px);
    }
    .danger { 
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white; 
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
    }
    .danger:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
    }
    .sm { padding: 8px 16px; font-size: 0.85rem; }
    .md { padding: 10px 20px; font-size: 0.95rem; }
    .lg { padding: 14px 28px; font-size: 1.1rem; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
    
    .spinner {
      width: 1.2rem;
      height: 1.2rem;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() onClick = new EventEmitter<Event>();
}
