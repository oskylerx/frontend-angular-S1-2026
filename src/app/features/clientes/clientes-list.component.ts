import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlertComponent],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.css']
})
export class ClientesListComponent implements OnInit {
  private clientesService = inject(ClientesService);

  clientes = signal<Cliente[]>([]);
  isLoading = signal(false);
  searchText = signal('');

  // Alertas
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('success');
  alertTitle = signal('');
  alertMessage = signal('');

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.isLoading.set(true);
    this.clientesService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ApiResponse<Cliente>) => {
          this.clientes.set(response.clientes || []);
        },
        error: (err) => {
          this.showErrorMessage('Error al cargar clientes', err.error?.mensaje || 'No se pudo conectar con el servidor.');
        }
      });
  }

  onSearch(): void {
    const term = this.searchText().trim();
    if (!term) {
      this.loadClientes();
      return;
    }

    this.isLoading.set(true);
    this.clientesService.search(term)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ApiResponse<Cliente>) => {
          this.clientes.set(response.clientes || []);
        },
        error: (err) => {
          this.showErrorMessage('Error en la búsqueda', err.error?.mensaje || 'Hubo un problema al buscar clientes.');
        }
      });
  }

  deleteCliente(id: number): void {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    this.clientesService.delete(id).subscribe({
      next: () => {
        this.showSuccessMessage('Éxito', 'Cliente eliminado correctamente');
        this.loadClientes();
      },
      error: (err) => {
        this.showErrorMessage('Error', err.error?.mensaje || 'No se pudo eliminar el cliente.');
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
