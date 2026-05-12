import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlmacenesService } from '../../core/services/almacenes.service';
import { Almacen, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-almacenes-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './almacenes-form.component.html',
  styleUrls: ['./almacenes-form.component.css']
})
export class AlmacenesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private almacenesService = inject(AlmacenesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  almacenForm!: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  codigoParam = signal<string | null>(null);

  // Alertas
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('success');
  alertTitle = signal('');
  alertMessage = signal('');

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      this.isEditMode.set(true);
      this.codigoParam.set(codigo);
      this.loadAlmacen(codigo);
    }
  }

  private initForm(): void {
    this.almacenForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required]],
      capacidad_total: [1, [Validators.required, Validators.min(1)]],
      capacidad_actual: [0, [Validators.required, Validators.min(0)]],
      estado: [true]
    }, { validators: this.capacityValidator });
  }

  // Validador personalizado para asegurar que actual <= total
  private capacityValidator(control: AbstractControl): ValidationErrors | null {
    const total = control.get('capacidad_total')?.value;
    const actual = control.get('capacidad_actual')?.value;
    
    if (total !== null && actual !== null && actual > total) {
      return { capacityExceeded: true };
    }
    return null;
  }

  loadAlmacen(codigo: string): void {
    this.isLoading.set(true);
    this.almacenesService.getByCodigo(codigo)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ApiResponse<Almacen>) => {
          if (response.almacen) {
            this.almacenForm.patchValue(response.almacen);
            if (this.isEditMode()) {
              this.almacenForm.get('codigo')?.disable();
            }
          }
        },
        error: (err) => {
          this.showErrorMessage('Error', 'No se pudo cargar la información del almacén.');
        }
      });
  }

  onSubmit(): void {
    if (this.almacenForm.invalid) {
      if (this.almacenForm.errors?.['capacityExceeded']) {
        this.showErrorMessage('Validación', 'La capacidad actual no puede ser mayor a la total.');
      }
      this.almacenForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const data = this.almacenForm.getRawValue();

    const request$ = this.isEditMode()
      ? this.almacenesService.update(this.codigoParam()!, data)
      : this.almacenesService.create(data);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.showSuccessMessage('¡Éxito!', 'Almacén guardado satisfactoriamente.');
          setTimeout(() => this.router.navigate(['/almacenes']), 1500);
        },
        error: (err) => {
          this.showErrorMessage('Error', err.error?.mensaje || 'Error al guardar el almacén.');
        }
      });
  }

  private showSuccessMessage(title: string, message: string): void {
    this.alertType.set('success');
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  private showErrorMessage(title: string, message: string): void {
    this.alertType.set('error');
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }
}
