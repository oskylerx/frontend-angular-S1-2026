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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermisosService } from '../../core/services/permisos.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Usuario, Permiso, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-permisos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit, OnDestroy {
  private permisosService = inject(PermisosService);
  private usuariosService = inject(UsuariosService);

  // State Signals
  usuarios = signal<Usuario[]>([]);
  usuarioSearchTerm = signal('');
  selectedUsuario = signal<Usuario | null>(null);
  
  usuarioPermisos = signal<Permiso[]>([]);
  allPermisos = signal<Permiso[]>([]);
  selectedPermisoId = signal<string | null>(null);
  
  isLoading = signal(false);
  
  // Alert Signals
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('error');
  alertTitle = signal('');
  alertMessage = signal('');

  // Computed: Filtered users list
  filteredUsuarios = computed(() => {
    const list = this.usuarios();
    const term = this.usuarioSearchTerm().toLowerCase().trim();
    if (!term) return list;
    return list.filter(u =>
      u.codigo.toLowerCase().includes(term) ||
      u.nombre.toLowerCase().includes(term)
    );
  });

  // Computed: Permissions available to assign (not already assigned)
  availablePermisos = computed(() => {
    const assignedIds = new Set(this.usuarioPermisos().map(p => p.id));
    return this.allPermisos().filter(p => !assignedIds.has(p.id));
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.usuariosService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.usuarios.set(response.usuarios || []),
        error: () => this.triggerAlert('error', 'Error', 'No se pudieron cargar los usuarios')
      });

    this.permisosService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.allPermisos.set(response.permisos || []),
        error: () => this.triggerAlert('error', 'Error', 'No se pudieron cargar los permisos maestros')
      });
  }

  selectUsuario(usuario: Usuario): void {
    this.selectedUsuario.set(usuario);
    this.selectedPermisoId.set(null);
    this.loadUsuarioPermisos(usuario.codigo);
  }

  private loadUsuarioPermisos(codigo: string): void {
    this.permisosService.getPermisosPorUsuario(codigo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.usuarioPermisos.set(response.permisos || []),
        error: () => this.usuarioPermisos.set([])
      });
  }

  addPermiso(): void {
    const user = this.selectedUsuario();
    const idStr = this.selectedPermisoId();
    if (!user || !idStr) return;

    const id_permiso = parseInt(idStr, 10);
    this.isLoading.set(true);

    this.permisosService.asignarPermiso(user.codigo, { id_permiso })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.triggerAlert('success', 'Completado', response.mensaje || 'Permiso asignado');
          this.selectedPermisoId.set(null);
          this.loadUsuarioPermisos(user.codigo);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.triggerAlert('error', 'Error', err.error?.mensaje || 'No se pudo asignar el permiso');
        }
      });
  }

  removePermiso(permisoId: number): void {
    const user = this.selectedUsuario();
    if (!user) return;

    this.permisosService.quitarPermiso(user.codigo, permisoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.triggerAlert('success', 'Privilegio Removido', response.mensaje || 'Permiso quitado');
          this.usuarioPermisos.update(prev => prev.filter(p => p.id !== permisoId));
        },
        error: (err) => {
          this.triggerAlert('error', 'Error', err.error?.mensaje || 'No se pudo remover el privilegio');
        }
      });
  }

  private triggerAlert(type: 'success' | 'error', title: string, message: string): void {
    this.alertType.set(type);
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  trackByUsuario(_: number, u: Usuario): string { return u.codigo; }
  trackByPermiso(_: number, p: Permiso): number { return p.id; }
}
