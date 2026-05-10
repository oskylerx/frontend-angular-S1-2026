import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertComponent } from '../../shared/components/alert.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, RouterModule],
  template: `
    <div class="forgot-container">
      <div class="forgot-card">
        <div class="forgot-header">
          <a routerLink="/auth/login" class="back-link">← Volver al Login</a>
          <h1>🔑 Recuperar Contraseña</h1>
          <p>Ingresa tu correo para recibir instrucciones de recuperación</p>
        </div>

        <app-alert
          [type]="alertType"
          [title]="alertTitle"
          [message]="alertMessage"
          [visible]="showAlert"
          [closable]="true"
          (closed)="showAlert = false"
        ></app-alert>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="tu@email.com"
              class="form-control"
              [class.error]="isFieldInvalid('email')"
            />
            <span class="error-text" *ngIf="isFieldInvalid('email')">
              Ingresa un correo válido
            </span>
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="isLoading || !forgotForm.valid"
          >
            {{ isLoading ? '⏳ Enviando...' : '📧 Enviar Instrucciones' }}
          </button>
        </form>

        <div class="forgot-footer">
          <p>¿Ya tienes el código? <a routerLink="/auth/reset-password">Restablecer aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .forgot-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .forgot-header {
      margin-bottom: 2rem;
    }

    .back-link {
      color: #3498db;
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      display: inline-block;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .forgot-header h1 {
      color: #2c3e50;
      margin: 1rem 0 0.5rem;
      font-size: 1.75rem;
    }

    .forgot-header p {
      color: #7f8c8d;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .forgot-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 2rem 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      color: #2c3e50;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #ecf0f1;
      border-radius: 4px;
      font-size: 0.95rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-text {
      color: #e74c3c;
      font-size: 0.85rem;
    }

    .btn-submit {
      padding: 0.75rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      margin-top: 0.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-submit:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }

    .forgot-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .forgot-footer a {
      color: #3498db;
      text-decoration: none;
    }

    .forgot-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotForm!: FormGroup;
  isLoading = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'warning' | 'info' = 'error';
  alertTitle = '';
  alertMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (!this.forgotForm.valid) {
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.forgotForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.alertType = 'success';
          this.alertTitle = '✓ Éxito';
          this.alertMessage = response.mensaje || 'Revisa tu correo para las instrucciones';
          this.showAlert = true;
          setTimeout(() => {
            this.router.navigate(['/auth/reset-password']);
          }, 3000);
        },
        error: (err) => {
          this.isLoading = false;
          this.alertType = 'error';
          this.alertTitle = 'Error';
          this.alertMessage = err.error?.mensaje || 'No pudimos procesar tu solicitud';
          this.showAlert = true;
        }
      });
  }

  isFieldInvalid(field: string): boolean {
    const f = this.forgotForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }
}
