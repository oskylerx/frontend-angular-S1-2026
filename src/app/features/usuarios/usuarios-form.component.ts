import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UsuariosService } from '../../core/services/usuarios.service';
import { ApiResponse, Usuario } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { PasswordChecklistComponent } from '../../shared/components/password-checklist.component';
import {
  evaluatePassword,
  strongPasswordValidator,
  type PasswordRules
} from '../../shared/utils/password.validators';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, PasswordChecklistComponent, RouterModule],
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.css']
})
export class UsuariosFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  usuarioForm!: FormGroup;
  
  // State Signals
  isEditing = signal(false);
  isLoading = signal(false);
  usuarioCodigo = signal<string | null>(null);
  
  // Alert Signals
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('error');
  alertTitle = signal('');
  alertMessage = signal('');
  
  passwordRules: PasswordRules = evaluatePassword('');
  private destroy$ = new Subject<void>();

  constructor() {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['codigo']) {
          this.isEditing.set(true);
          this.usuarioCodigo.set(params['codigo']);
          this.syncPasswordValidators();
          this.loadUsuario(params['codigo']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.usuarioForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      ci: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      contrasena: [''],
      estado: [true]
    });

    this.syncPasswordValidators();

    this.usuarioForm.get('contrasena')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.passwordRules = evaluatePassword(String(value ?? ''));
      });
  }

  generateMagicCode(): void {
    if (this.isEditing()) return;
    const rol = this.usuarioForm.get('rol')?.value;
    const prefix = rol === 'admin' ? 'ADM' : rol === 'supervisor' ? 'SUP' : rol === 'cajero' ? 'CAJ' : 'USR';
    const random = Math.floor(100 + Math.random() * 900);
    this.usuarioForm.patchValue({ codigo: `${prefix}-${random}` });
  }

  private syncPasswordValidators(): void {
    const control = this.usuarioForm?.get('contrasena');
    if (!control) return;

    if (this.isEditing()) {
      control.setValidators([(c) => {
        if (!c.value) return null;
        return strongPasswordValidator()(c);
      }]);
    } else {
      control.setValidators([strongPasswordValidator()]);
    }
    control.updateValueAndValidity();
  }

  private loadUsuario(codigo: string): void {
    this.usuariosService.getByCode(codigo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Usuario>) => {
          const usuario = response.data || response.usuario;
          if (usuario) {
            this.usuarioForm.patchValue({
              codigo: usuario.codigo,
              nombre: usuario.nombre,
              ci: usuario.ci,
              email: usuario.email,
              rol: usuario.rol,
              estado: usuario.estado
            });
            this.usuarioForm.get('codigo')?.disable();
          }
        },
        error: (err) => {
          this.triggerAlert('error', 'Error', err.error?.mensaje || 'No pudimos cargar el usuario');
        }
      });
  }

  onSubmit(): void {
    if (!this.usuarioForm.valid) return;

    this.isLoading.set(true);
    const formValue = {
      ...this.usuarioForm.getRawValue(),
      contrasena: this.usuarioForm.get('contrasena')?.value || undefined
    };

    const codigo = this.usuarioCodigo();

    if (this.isEditing() && codigo) {
      this.usuariosService.update(codigo, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.handleSuccess('Usuario actualizado correctamente'),
          error: (err) => this.handleError(err, 'No pudimos actualizar el usuario')
        });
    } else {
      this.usuariosService.create(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.handleSuccess('Usuario creado correctamente'),
          error: (err) => this.handleError(err, 'No pudimos crear el usuario')
        });
    }
  }

  private handleSuccess(message: string): void {
    this.isLoading.set(false);
    this.triggerAlert('success', 'Éxito', message);
    setTimeout(() => this.router.navigate(['/usuarios']), 1500);
  }

  private handleError(err: any, defaultMsg: string): void {
    this.isLoading.set(false);
    this.triggerAlert('error', 'Error', err.error?.mensaje || defaultMsg);
  }

  private triggerAlert(type: 'success' | 'error', title: string, message: string): void {
    this.alertType.set(type);
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  cancel(): void {
    this.router.navigate(['/usuarios']);
  }

  isFieldInvalid(field: string): boolean {
    const f = this.usuarioForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }
}
