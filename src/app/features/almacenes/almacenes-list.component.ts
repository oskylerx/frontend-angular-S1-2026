import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlmacenesService } from '../../core/services/almacenes.service';
import { Almacen, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-almacenes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlertComponent],
  templateUrl: './almacenes-list.component.html',
  styleUrls: ['./almacenes-list.component.css']
})
export class AlmacenesListComponent implements OnInit {
  private almacenesService = inject(AlmacenesService);

  almacenes = signal<Almacen[]>([]);
  isLoading = signal(false);
  searchText = signal('');

  // Alertas
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('success');
  alertTitle = signal('');
  alertMessage = signal('');

  ngOnInit(): void {
    this.loadAlmacenes();
  }

  loadAlmacenes(): void {
    this.isLoading.set(true);
    this.almacenesService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ApiResponse<Almacen>) => {
          this.almacenes.set(response.almacenes || []);
        },
        error: (err) => {
          this.showErrorMessage('Error', 'No se pudieron cargar los almacenes.');
        }
      });
  }

  onSearch(): void {
    const term = this.searchText().trim();
    if (!term) {
      this.loadAlmacenes();
      return;
    }

    this.isLoading.set(true);
    this.almacenesService.search(term)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ApiResponse<Almacen>) => {
          this.almacenes.set(response.almacenes || []);
        },
        error: (err) => {
          this.showErrorMessage('Error', 'Error al buscar almacenes.');
        }
      });
  }

  toggleEstado(almacen: Almacen): void {
    const nuevoEstado = !almacen.estado;
    this.almacenesService.toggleEstado(almacen.codigo, nuevoEstado).subscribe({
      next: () => {
        this.showSuccessMessage('Éxito', `Almacén ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
        this.loadAlmacenes();
      },
      error: (err) => {
        this.showErrorMessage('Error', 'No se pudo cambiar el estado.');
      }
    });
  }

  deleteAlmacen(codigo: string): void {
    if (!confirm(`¿Está seguro de eliminar el almacén ${codigo}?`)) return;

    this.almacenesService.delete(codigo).subscribe({
      next: () => {
        this.showSuccessMessage('Éxito', 'Almacén eliminado correctamente');
        this.loadAlmacenes();
      },
      error: (err) => {
        this.showErrorMessage('Error', 'No se pudo eliminar el almacén.');
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
