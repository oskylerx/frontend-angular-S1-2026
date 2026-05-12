import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { UIService } from '../../core/services/ui.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface MenuItem {
  label: string;
  route: string;
  icon: SafeHtml;
  permissions?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private sessionService = inject(SessionService);
  private uiService = inject(UIService);
  
  visibleMenuItems = signal<MenuItem[]>([]);
  isCollapsed = this.uiService.isSidebarCollapsed;
  private destroy$ = new Subject<void>();

  private allMenuItems: MenuItem[] = [
    { 
      label: 'Dashboard', 
      route: '/dashboard', 
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>') 
    },
    { 
      label: 'Usuarios', 
      route: '/usuarios', 
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'), 
      permissions: ['usuario.ver'] 
    },
    { 
      label: 'Seguridad', 
      route: '/permisos', 
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'), 
      permissions: ['permiso.ver'] 
    },
    { 
      label: 'Proveedores', 
      route: '/proveedores', 
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'), 
      permissions: ['proveedor.ver'] 
    },
    { 
      label: 'Clientes', 
      route: '/clientes', 
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>'), 
      permissions: ['cliente.ver'] 
    },
    { 
      label: 'Almacenes', 
      route: '/almacenes', 
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'), 
      permissions: ['almacen.ver'] 
    },
    { 
      label: 'Auditoría', 
      route: '/bitacora', 
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'), 
      permissions: ['bitacora.ver'] 
    }
  ];

  ngOnInit(): void {
    this.sessionService.session$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateVisibleMenuItems();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.uiService.toggleSidebar();
  }

  private updateVisibleMenuItems(): void {
    const usuario = this.sessionService.getUsuario();
    const permisos = this.sessionService.getPermisos();
    
    console.log('[Sidebar] Usuario:', usuario?.codigo, 'Rol:', usuario?.rol);
    console.log('[Sidebar] Permisos detectados:', permisos);

    const items = this.allMenuItems.filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }
      return this.sessionService.hasSomePermiso(item.permissions);
    });
    
    this.visibleMenuItems.set(items);
  }
}
