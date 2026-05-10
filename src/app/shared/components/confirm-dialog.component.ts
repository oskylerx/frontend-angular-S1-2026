import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="modal-overlay" (click)="cancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>Confirmar acción</h2>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="cancel()">Cancelar</button>
          <button class="btn-confirm" (click)="confirm()">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 400px;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    h2 {
      margin-top: 0;
      color: #2c3e50;
      font-size: 1.25rem;
    }

    p {
      color: #555;
      margin: 1rem 0;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    button {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.3s;
    }

    .btn-cancel {
      background-color: #95a5a6;
      color: white;
    }

    .btn-cancel:hover {
      background-color: #7f8c8d;
    }

    .btn-confirm {
      background-color: #e74c3c;
      color: white;
    }

    .btn-confirm:hover {
      background-color: #c0392b;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible: boolean = false;
  @Input() message: string = '';
  @Input() confirmText: string = 'Confirmar';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm(): void {
    this.confirmed.emit();
    this.visible = false;
  }

  cancel(): void {
    this.cancelled.emit();
    this.visible = false;
  }
}
