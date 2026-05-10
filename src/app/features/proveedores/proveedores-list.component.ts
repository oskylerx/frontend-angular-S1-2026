import { 
  ChangeDetectionStrategy, 
  Component, 
  OnInit, 
  OnDestroy, 
  signal, 
  computed, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProveedoresService } from '../../core/services/proveedores.service';
import { Proveedor, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, AlertComponent, ConfirmDialogComponent],
  templateUrl: './proveedores-list.component.html',
  styleUrls: ['./proveedores-list.component.css']
})
export class ProveedoresListComponent implements OnInit, OnDestroy {
  private proveedoresService = inject(ProveedoresService);

  // State Signals
  proveedores = signal<Proveedor[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  
  // Alert Signals
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('error');
  alertTitle = signal('');
  alertMessage = signal('');
  
  // Confirm Dialog Signals
  showConfirmDelete = signal(false);
  proveedorToDelete = signal<string | null>(null);

  // Computed: Filtered providers list
  filteredProveedores = computed(() => {
    const list = this.proveedores();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return list;
    return list.filter(p =>
      p.codigo.toLowerCase().includes(term) ||
      p.nombre.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadProveedores();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProveedores(): void {
    this.isLoading.set(true);
    this.proveedoresService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Proveedor>) => {
          this.isLoading.set(false);
          this.proveedores.set(response.proveedores || []);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.triggerAlert('error', 'Error', err.error?.mensaje || 'No pudimos cargar los proveedores');
        }
      });
  }

  deleteProveedor(codigo: string): void {
    this.proveedorToDelete.set(codigo);
    this.showConfirmDelete.set(true);
  }

  confirmDelete(): void {
    const codigo = this.proveedorToDelete();
    if (!codigo) return;

    this.proveedoresService.delete(codigo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.triggerAlert('success', 'Completado', response.mensaje || 'Proveedor eliminado');
          this.proveedores.update(prev => prev.filter(p => p.codigo !== codigo));
          this.showConfirmDelete.set(false);
          this.proveedorToDelete.set(null);
        },
        error: (err) => {
          this.triggerAlert('error', 'Error', err.error?.mensaje || 'No se pudo eliminar');
          this.showConfirmDelete.set(false);
        }
      });
  }

  private triggerAlert(type: 'success' | 'error', title: string, message: string): void {
    this.alertType.set(type);
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  trackByCodigo(_: number, p: Proveedor): string { return p.codigo; }
}
