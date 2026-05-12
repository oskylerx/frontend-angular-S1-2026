import { 
  ChangeDetectionStrategy, 
  Component, 
  OnInit, 
  OnDestroy, 
  signal, 
  computed, 
  effect 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BitacoraService } from '../../core/services/bitacora.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { BitacoraRegistro, Usuario, ApiResponse } from '../../core/models/index';
import { AlertComponent } from '../../shared/components/alert.component';
import { Subject } from 'rxjs';
import { finalize, takeUntil, timeout } from 'rxjs/operators';

type FilterType = 'all' | 'usuario' | 'modulo';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit, OnDestroy {
  // Signals for state
  registros = signal<BitacoraRegistro[]>([]);
  usuarios = signal<Usuario[]>([]);
  currentFilter = signal<FilterType>('all');
  isLoading = signal(false);
  showAlert = signal(false);
  alertType = signal<'success' | 'error'>('error');
  alertTitle = signal('');
  alertMessage = signal('');

  // Form signals
  searchText = signal('');
  selectedUsuario = signal('');
  selectedModulo = signal('');
  startDate = signal('');
  endDate = signal('');

  private destroy$ = new Subject<void>();

  // Filtered registrations computed signal
  filteredRegistros = computed(() => {
    let source = this.registros();
    const search = this.searchText().toLowerCase();
    const start = this.startDate();
    const end = this.endDate();

    // Text search
    if (search) {
      source = source.filter(r => 
        r.descripcion.toLowerCase().includes(search) || 
        r.ip.toLowerCase().includes(search) ||
        r.codigo_usuario.toLowerCase().includes(search) ||
        r.accion.toLowerCase().includes(search)
      );
    }

    // Date filtering
    if (start) {
      const startTime = new Date(start).getTime();
      source = source.filter(r => new Date(r.fecha).getTime() >= startTime);
    }

    if (end) {
      // Add one day to end date to include the whole day
      const endDateVal = new Date(end);
      endDateVal.setDate(endDateVal.getDate() + 1);
      const endTime = endDateVal.getTime();
      source = source.filter(r => new Date(r.fecha).getTime() <= endTime);
    }

    return source;
  });

  constructor(
    private bitacoraService: BitacoraService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadRegistros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsuarios(): void {
    this.usuariosService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Usuario>) => {
          this.usuarios.set(response.usuarios || []);
        },
        error: () => {
          this.usuarios.set([]);
        }
      });
  }

  loadRegistros(): void {
    this.fetchRegistros(this.bitacoraService.getAll());
  }

  setFilter(filter: FilterType): void {
    this.currentFilter.set(filter);
    this.selectedUsuario.set('');
    this.selectedModulo.set('');
    this.loadRegistros();
  }

  onUsuarioChange(codigo: string): void {
    this.selectedUsuario.set(codigo);
    this.applyFilter();
  }

  onModuloChange(modulo: string): void {
    this.selectedModulo.set(modulo);
    this.applyFilter();
  }

  applyFilter(): void {
    const filter = this.currentFilter();
    const user = this.selectedUsuario();
    const module = this.selectedModulo();

    if (filter === 'usuario' && user) {
      this.fetchRegistros(this.bitacoraService.getByUsuario(user));
    } else if (filter === 'modulo' && module) {
      this.fetchRegistros(this.bitacoraService.getByModulo(module));
    } else {
      this.loadRegistros();
    }
  }

  private fetchRegistros(request$: ReturnType<BitacoraService['getAll']>): void {
    this.isLoading.set(true);
    request$
      .pipe(
        timeout(15000),
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: ApiResponse<BitacoraRegistro>) => {
          this.registros.set(this.sortRegistros(response.registros ?? []));
        },
        error: (err) => {
          this.registros.set([]);
          this.alertType.set('error');
          this.alertTitle.set('Error de Conexión');
          this.alertMessage.set(err?.error?.mensaje || 'No pudimos conectar con el servidor de auditoría.');
          this.showAlert.set(true);
        }
      });
  }

  private sortRegistros(registros: BitacoraRegistro[]): BitacoraRegistro[] {
    return [...registros].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  }

  formatDate(fecha: string) {
    const date = new Date(fecha);
    const d = date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
    const t = date.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return { date: d, time: t };
  }

  getActionType(accion: string): string {
    const action = accion.toLowerCase();
    if (action.includes('crear') || action.includes('create')) return 'create';
    if (action.includes('actualizar') || action.includes('update') || action.includes('edit')) return 'update';
    if (action.includes('eliminar') || action.includes('delete') || action.includes('desactivar')) return 'delete';
    if (action.includes('login') || action.includes('inicia')) return 'login';
    if (action.includes('ver') || action.includes('view')) return 'view';
    return 'other';
  }

  clearDateRange(): void {
    this.startDate.set('');
    this.endDate.set('');
  }

  resetAllFilters(): void {
    this.searchText.set('');
    this.selectedUsuario.set('');
    this.selectedModulo.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.setFilter('all');
  }

  exportAudit(): void {
    const filters = {
      codigoUsuario: this.selectedUsuario(),
      startDate: this.startDate(),
      endDate: this.endDate()
    };

    this.isLoading.set(true);
    this.bitacoraService.exportByEmail(filters)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.alertType.set('success');
          this.alertTitle.set('¡Envío Exitoso!');
          this.alertMessage.set(response.mensaje || 'El reporte ha sido enviado satisfactoriamente a su buzón de correo.');
          this.showAlert.set(true);
        },
        error: (err) => {
          this.alertType.set('error');
          this.alertTitle.set('Error al Exportar');
          this.alertMessage.set(err?.error?.mensaje || 'No pudimos enviar el reporte en este momento. Intente más tarde.');
          this.showAlert.set(true);
        }
      });
  }

  trackByUsuario(_: number, usuario: Usuario): string {
    return usuario.codigo;
  }

  trackByRegistro(index: number, registro: BitacoraRegistro): string {
    return registro.id ? String(registro.id) : `${registro.codigo_usuario}-${registro.fecha}-${index}`;
  }
}

