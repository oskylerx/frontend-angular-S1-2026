import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente, Direccion, Contacto, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-clientes-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './clientes-form.component.html',
  styleUrls: ['./clientes-form.component.css']
})
export class ClientesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clienteForm!: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  idParam = signal<string | null>(null);

  // Alertas
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('success');
  alertTitle = signal('');
  alertMessage = signal('');

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('codigo'); 
    if (id) {
      this.isEditMode.set(true);
      this.idParam.set(id);
      this.loadCliente(id);
    }
  }

  private initForm(): void {
    this.clienteForm = this.fb.group({
      ci: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      correo_electronico: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      direcciones: this.fb.array([]),
      contactos: this.fb.array([])
    });
  }

  get direcciones() { return this.clienteForm.get('direcciones') as FormArray; }
  get contactos() { return this.clienteForm.get('contactos') as FormArray; }

  addDireccion(dir?: Direccion): void {
    this.direcciones.push(this.fb.group({
      direccion: [dir?.direccion || '', Validators.required],
      ciudad: [dir?.ciudad || '', Validators.required],
      es_principal: [dir?.es_principal || false]
    }));
  }

  removeDireccion(index: number): void { this.direcciones.removeAt(index); }

  addContacto(con?: Contacto): void {
    this.contactos.push(this.fb.group({
      nombre: [con?.nombre || '', Validators.required],
      telefono: [con?.telefono || '', Validators.required],
      cargo: [con?.cargo || '']
    }));
  }

  removeContacto(index: number): void { this.contactos.removeAt(index); }

  loadCliente(id: string): void {
    this.isLoading.set(true);
    this.clientesService.getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ApiResponse<Cliente>) => {
          const cliente = response.cliente;
          if (cliente) {
            this.clienteForm.patchValue({
              ci: cliente.ci,
              nombre: cliente.nombre,
              correo_electronico: cliente.correo_electronico,
              telefono: cliente.telefono
            });
            cliente.direcciones?.forEach(d => this.addDireccion(d));
            cliente.contactos?.forEach(c => this.addContacto(c));
          }
        },
        error: (err) => {
          console.error('Error al cargar cliente:', err);
          this.showErrorMessage('Error', err.error?.mensaje || 'No se pudo cargar el cliente');
        }
      });
  }

  onSubmit(): void {
    console.log('Intentando guardar cliente...');
    
    if (this.clienteForm.invalid) {
      console.warn('Formulario inválido:', this.clienteForm.errors);
      // Mostrar qué campos fallan
      Object.keys(this.clienteForm.controls).forEach(key => {
        const controlErrors = this.clienteForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`Campo ${key} con errores:`, controlErrors);
        }
      });
      
      this.showErrorMessage('Formulario Incompleto', 'Por favor, rellene todos los campos obligatorios marcados en rojo.');
      this.clienteForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.showAlert.set(false);
    const data = this.clienteForm.getRawValue();

    const request$ = this.isEditMode() 
      ? this.clientesService.update(this.idParam()!, data)
      : this.clientesService.create(data);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          console.log('Cliente guardado con éxito');
          this.alertType.set('success');
          this.alertTitle.set('¡Éxito!');
          this.alertMessage.set('El cliente ha sido guardado satisfactoriamente.');
          this.showAlert.set(true);
          
          // Redirigir tras un breve delay para que vean el mensaje
          setTimeout(() => this.router.navigate(['/clientes']), 1500);
        },
        error: (err) => {
          console.error('Error del servidor al guardar:', err);
          this.showErrorMessage('Error al guardar', err.error?.mensaje || 'El servidor no pudo procesar la solicitud.');
        }
      });
  }

  private showErrorMessage(title: string, message: string): void {
    this.alertType.set('error');
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }
}
