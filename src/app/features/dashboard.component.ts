import { 
  Component, 
  OnInit, 
  OnDestroy, 
  signal, 
  computed, 
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from '../core/services/session.service';
import { Usuario } from '../core/models/index';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface QuickAccess {
  title: string;
  description: string;
  icon: string | SafeHtml;
  route: string;
  color: string;
  permission?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private sessionService = inject(SessionService);

  // Signals for local state management
  usuario = signal<Usuario | null>(null);
  permisos = signal<string[]>([]);
  greeting = signal<string>(this.getDayMoment());
  
  private allQuickAccess: QuickAccess[] = [
    {
      title: 'Usuarios',
      description: 'Control de accesos y perfiles',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'),
      route: '/usuarios',
      color: '#6366f1',
      permission: 'usuario.ver'
    },
    {
      title: 'Seguridad',
      description: 'Configuración de permisos',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'),
      route: '/permisos',
      color: '#f43f5e',
      permission: 'permiso.ver'
    },
    {
      title: 'Proveedores',
      description: 'Aliados estratégicos',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'),
      route: '/proveedores',
      color: '#10b981',
      permission: 'proveedor.ver'
    },
    {
      title: 'Auditoría',
      description: 'Trazabilidad de acciones',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'),
      route: '/bitacora',
      color: '#f59e0b',
      permission: 'bitacora.ver'
    },
    {
      title: 'Almacenes',
      description: 'Inventario y almacenamiento',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'),
      route: '/almacenes',
      color: '#3b82f6',
      permission: 'almacen.ver'
    }
  ];

  // Computed signal to get only the first name safely
  firstName = computed(() => {
    const name = this.usuario()?.nombre;
    return name ? name.split(' ')[0] : 'Usuario';
  });

  // Computed signal for filtered access based on permissions
  visibleQuickAccess = computed(() => {
    const activePerms = this.permisos();
    const user = this.usuario();
    
    return this.allQuickAccess.filter(access => {
      if (!access.permission) return true;
      if (user?.rol === 'admin') return true;
      return activePerms.includes(access.permission);
    });
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Sync session data with signals
    this.sessionService.session$
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        if (session) {
          this.usuario.set(session.usuario);
          this.permisos.set(session.permisos);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDayMoment(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos Días';
    if (hour < 18) return 'Buenas Tardes';
    return 'Buenas Noches';
  }
}

