import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProveedoresService } from '../../core/services/proveedores.service';
import { Proveedor, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-proveedores-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, RouterModule],
  templateUrl: './proveedores-form.component.html',
  styleUrls: ['./proveedores-form.component.css']
})
export class ProveedoresFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private proveedoresService = inject(ProveedoresService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  proveedorForm!: FormGroup;

  // State Signals
  isEditing = signal(false);
  isLoading = signal(false);
  proveedorCodigo = signal<string | null>(null);

  // Alert Signals
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('error');
  alertTitle = signal('');
  alertMessage = signal('');

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
          this.proveedorCodigo.set(params['codigo']);
          this.loadProveedor(params['codigo']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.proveedorForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      descripcion: [''],
      estado: [true]
    });
  }

  generateMagicCode(): void {
    if (this.isEditing()) return;
    const random = Math.floor(1000 + Math.random() * 9000);
    this.proveedorForm.patchValue({ codigo: `PROV-${random}` });
  }

  private loadProveedor(codigo: string): void {
    this.proveedoresService.getByCode(codigo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Proveedor>) => {
          const proveedor = response.data || response.proveedores?.[0];
          if (proveedor) {
            this.proveedorForm.patchValue({
              codigo: proveedor.codigo,
              nombre: proveedor.nombre,
              email: proveedor.email,
              telefono: proveedor.telefono,
              direccion: proveedor.direccion,
              descripcion: proveedor.descripcion,
              estado: proveedor.estado
            });
            this.proveedorForm.get('codigo')?.disable();
          }
        },
        error: (err) => {
          this.triggerAlert('error', 'Error', err.error?.mensaje || 'No pudimos cargar el proveedor');
        }
      });
  }

  onSubmit(): void {
    if (!this.proveedorForm.valid) return;

    this.isLoading.set(true);
    const formValue = this.proveedorForm.getRawValue();
    const codigo = this.proveedorCodigo();

    if (this.isEditing() && codigo) {
      this.proveedoresService.update(codigo, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.handleSuccess('Proveedor actualizado correctamente'),
          error: (err) => this.handleError(err, 'No pudimos actualizar')
        });
    } else {
      this.proveedoresService.create(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.handleSuccess('Proveedor creado correctamente'),
          error: (err) => this.handleError(err, 'No pudimos crear')
        });
    }
  }

  private handleSuccess(message: string): void {
    this.isLoading.set(false);
    this.triggerAlert('success', 'Éxito', message);
    setTimeout(() => this.router.navigate(['/proveedores']), 1500);
  }

  private handleError(err: any, dMsg: string): void {
    this.isLoading.set(false);
    this.triggerAlert('error', 'Error', err.error?.mensaje || dMsg);
  }

  private triggerAlert(type: 'success' | 'error', title: string, message: string): void {
    this.alertType.set(type);
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  cancel(): void {
    this.router.navigate(['/proveedores']);
  }

  isFieldInvalid(field: string): boolean {
    const f = this.proveedorForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }
}
