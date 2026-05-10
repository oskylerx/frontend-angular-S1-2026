import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" [ngClass]="['alert', 'alert-' + type]">
      <div class="alert-content">
        <span class="alert-icon">{{ getIcon() }}</span>
        <div class="alert-text">
          <strong>{{ title }}</strong>
          <p *ngIf="message">{{ message }}</p>
        </div>
      </div>
      <button class="alert-close" (click)="close()" *ngIf="closable">✕</button>
    </div>
  `,
  styles: [`
    .alert {
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideIn 0.3s ease-in;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }

    .alert-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .alert-content {
      display: flex;
      gap: 0.75rem;
      flex: 1;
    }

    .alert-icon {
      font-size: 1.25rem;
      min-width: 25px;
    }

    .alert-text {
      flex: 1;
    }

    .alert-text strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .alert-text p {
      margin: 0;
      font-size: 0.9rem;
    }

    .alert-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      padding: 0;
      width: 30px;
      height: 30px;
    }

    .alert-close:hover {
      opacity: 1;
    }
  `]
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() visible: boolean = false;
  @Input() closable: boolean = true;
  @Input() autoClose: boolean = true;
  @Input() autoCloseDuration: number = 5000;

  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.visible && this.autoClose) {
      setTimeout(() => this.close(), this.autoCloseDuration);
    }
  }

  close(): void {
    this.visible = false;
    this.closed.emit();
  }

  getIcon(): string {
    const icons: { [key in AlertType]: string } = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[this.type];
  }
}
