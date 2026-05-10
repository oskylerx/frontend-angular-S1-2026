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
import { UsuariosService } from '../../core/services/usuarios.service';
import { SessionService } from '../../core/services/session.service';
import { Usuario, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, AlertComponent, ConfirmDialogComponent],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent implements OnInit, OnDestroy {
  private usuariosService = inject(UsuariosService);
  private sessionService = inject(SessionService);

  // Signals for state management
  usuarios = signal<Usuario[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  
  // Alert signals
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('error');
  alertTitle = signal('');
  alertMessage = signal('');
  
  // Dialog signals
  showConfirmDelete = signal(false);
  userToDelete = signal<string | null>(null);

  // Computed signal for filtered list
  filteredUsuarios = computed(() => {
    const list = this.usuarios();
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) return list;
    
    return list.filter(u =>
      u.codigo.toLowerCase().includes(term) ||
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadUsuarios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsuarios(): void {
    this.isLoading.set(true);
    this.usuariosService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Usuario>) => {
          this.usuarios.set(response.usuarios || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.alertType.set('error');
          this.alertTitle.set('Error');
          this.alertMessage.set(err.error?.mensaje || 'No pudimos cargar los usuarios');
          this.showAlert.set(true);
        }
      });
  }

  viewUsuario(codigo: string): void {
    this.alertType.set('success');
    this.alertTitle.set('Información');
    this.alertMessage.set(`Usuario ID: ${codigo}. Gestión disponible en edición.`);
    this.showAlert.set(true);
  }

  deleteUsuario(codigo: string): void {
    this.userToDelete.set(codigo);
    this.showConfirmDelete.set(true);
  }

  confirmDelete(): void {
    const codigo = this.userToDelete();
    if (!codigo) return;

    this.usuariosService.delete(codigo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.alertType.set('success');
          this.alertTitle.set('Eliminado');
          this.alertMessage.set(response.mensaje || 'Usuario eliminado correctamente');
          this.showAlert.set(true);
          
          // Reactive update
          this.usuarios.update(prev => prev.filter(u => u.codigo !== codigo));
        },
        error: (err) => {
          this.alertType.set('error');
          this.alertTitle.set('Error');
          this.alertMessage.set(err.error?.mensaje || 'No pudimos eliminar el usuario');
          this.showAlert.set(true);
        }
      });

    this.userToDelete.set(null);
    this.showConfirmDelete.set(false);
  }

  isMainAdmin(usuario: Usuario): boolean {
    return usuario.rol === 'admin';
  }

  hasPermiso(p: string): boolean {
    return this.sessionService.hasPermiso(p);
  }

  trackByCodigo(_: number, usuario: Usuario): string {
    return usuario.codigo;
  }
}
