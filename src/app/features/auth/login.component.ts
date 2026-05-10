import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertComponent } from '../../shared/components/alert.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, RouterModule],
  template: `
    <div class="login-page">
      <!-- Background Abstract Elements -->
      <div class="bg-blur blur-1"></div>
      <div class="bg-blur blur-2"></div>

      <div class="login-card">
        <header class="login-header">
          <div class="brand">
            <div class="logo-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
              </svg>
            </div>
            <span class="brand-name">MarketOS</span>
          </div>
          <h1>Bienvenido</h1>
          <p>Ingresa tus credenciales para acceder al panel administrativo.</p>
        </header>

        <app-alert
          [type]="alertType()"
          [title]="alertTitle()"
          [message]="alertMessage()"
          [visible]="showAlert()"
          [closable]="true"
          (closed)="showAlert.set(false)"
        ></app-alert>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label>Código de Usuario</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                formControlName="codigo"
                placeholder="Ej: ADM-101"
                class="form-control"
                [class.error]="isFieldInvalid('codigo')"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label>Contraseña</label>
              <a routerLink="/auth/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type="password"
                formControlName="contrasena"
                placeholder="••••••••"
                class="form-control"
                [class.error]="isFieldInvalid('contrasena')"
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="isLoading() || !loginForm.valid"
          >
            <span *ngIf="!isLoading()">Acceder al Sistema</span>
            <div *ngIf="isLoading()" class="loader"></div>
          </button>
        </form>

        <footer class="login-footer">
          <p>&copy; 2026 Admin Portal. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --text-pri: #0f172a;
      --text-sec: #64748b;
      --bg: #f8fafc;
      --white: #ffffff;
      --border: #e2e8f0;
    }

    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg);
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
    }

    /* Abstract Background */
    .bg-blur {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
      z-index: 0;
    }
    .blur-1 { background: #c7d2fe; top: -100px; left: -100px; }
    .blur-2 { background: #ede9fe; bottom: -100px; right: -100px; }

    .login-card {
      background: var(--white);
      width: 100%;
      max-width: 440px;
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.8);
      position: relative;
      z-index: 10;
      backdrop-filter: blur(10px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .logo-box {
      width: 32px;
      height: 32px;
      background: var(--primary);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-box svg { width: 18px; height: 18px; }
    .brand-name { font-weight: 800; font-size: 1.1rem; color: var(--text-pri); letter-spacing: -0.02em; }

    .login-header h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-pri);
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .login-header p {
      color: var(--text-sec);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 2.5rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-pri);
    }

    .forgot-link {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: var(--text-sec);
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-pri);
      transition: all 0.2s;
      background: #fcfdfe;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .form-control.error {
      border-color: #fee2e2;
      background: #fffafa;
    }

    .btn-submit {
      margin-top: 1rem;
      padding: 0.85rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    .btn-submit:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 6px 15px rgba(99, 102, 241, 0.35);
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }

    .loader {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .login-footer {
      margin-top: 3rem;
      text-align: center;
    }

    .login-footer p {
      font-size: 0.75rem;
      color: var(--text-sec);
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .login-card { padding: 2rem; }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    codigo: ['', Validators.required],
    contrasena: ['', Validators.required]
  });

  isLoading = signal(false);
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('error');
  alertTitle = signal('');
  alertMessage = signal('');
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.alertType.set('success');
            this.alertTitle.set('¡Bienvenido!');
            this.alertMessage.set('Acceso concedido correctamente.');
            this.showAlert.set(true);
            setTimeout(() => this.router.navigate(['/dashboard']), 800);
          } else {
            this.triggerError(response.mensaje || 'Credenciales inválidas');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.triggerError(err.error?.mensaje || 'Error al conectar con el servidor');
        }
      });
  }

  private triggerError(msg: string): void {
    this.alertType.set('error');
    this.alertTitle.set('Fallo de Acceso');
    this.alertMessage.set(msg);
    this.showAlert.set(true);
  }

  isFieldInvalid(field: string): boolean {
    const f = this.loginForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }
}
