import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertComponent } from '../../shared/components/alert.component';
import { PasswordChecklistComponent } from '../../shared/components/password-checklist.component';
import { evaluatePassword, strongPasswordValidator } from '../../shared/utils/password.validators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, PasswordChecklistComponent, RouterModule],
  template: `
    <div class="reset-container">
      <div class="reset-card">
        <div class="reset-header">
          <a routerLink="/auth/login" class="back-link">← Volver al Login</a>
          <h1>🔐 Restablecer Contraseña</h1>
          <p>Ingresa el código de recuperación y tu nueva contraseña</p>
        </div>

        <app-alert
          [type]="alertType"
          [title]="alertTitle"
          [message]="alertMessage"
          [visible]="showAlert"
          [closable]="true"
          (closed)="showAlert = false"
        ></app-alert>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form">
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

          <div class="form-group">
            <label for="codigo">Código de Recuperación</label>
            <input
              id="codigo"
              type="text"
              formControlName="codigo"
              placeholder="Código de 6 dígitos"
              class="form-control"
              [class.error]="isFieldInvalid('codigo')"
            />
            <span class="error-text" *ngIf="isFieldInvalid('codigo')">
              El código es requerido
            </span>
          </div>

          <div class="form-group">
            <label for="nuevaContrasena">Nueva Contraseña</label>
            <input
              id="nuevaContrasena"
              type="password"
              formControlName="nuevaContrasena"
              placeholder="Contrasena segura"
              class="form-control"
              [class.error]="isFieldInvalid('nuevaContrasena')"
            />
            <span class="error-text" *ngIf="isFieldInvalid('nuevaContrasena')">
              La contrasena no cumple los requisitos
            </span>
            <app-password-checklist [rules]="passwordRules"></app-password-checklist>
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="isLoading || !resetForm.valid"
          >
            {{ isLoading ? '⏳ Cambiando...' : '✓ Cambiar Contraseña' }}
          </button>
        </form>

        <div class="reset-footer">
          <p>¿No recibiste el código? <a routerLink="/auth/forgot-password">Solicitar nuevamente</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .reset-card {
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

    .reset-header {
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

    .reset-header h1 {
      color: #2c3e50;
      margin: 1rem 0 0.5rem;
      font-size: 1.75rem;
    }

    .reset-header p {
      color: #7f8c8d;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .reset-form {
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

    .reset-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .reset-footer a {
      color: #3498db;
      text-decoration: none;
    }

    .reset-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm!: FormGroup;
  isLoading = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'warning' | 'info' = 'error';
  alertTitle = '';
  alertMessage = '';
  private destroy$ = new Subject<void>();
  passwordRules = evaluatePassword('');

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
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      codigo: ['', Validators.required],
      nuevaContrasena: ['', [strongPasswordValidator()]]
    });
    this.resetForm.get('nuevaContrasena')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.passwordRules = evaluatePassword(String(value ?? ''));
    });
  }

  onSubmit(): void {
    if (!this.resetForm.valid) {
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.resetForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.alertType = 'success';
          this.alertTitle = '✓ Éxito';
          this.alertMessage = response.mensaje || 'Contraseña actualizada. Inicia sesión con tu nueva contraseña';
          this.showAlert = true;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (err) => {
          this.isLoading = false;
          this.alertType = 'error';
          this.alertTitle = 'Error';
          this.alertMessage = err.error?.mensaje || 'No pudimos cambiar tu contraseña';
          this.showAlert = true;
        }
      });
  }

  isFieldInvalid(field: string): boolean {
    const f = this.resetForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }
}
