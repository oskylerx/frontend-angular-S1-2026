import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { AuthService } from '../../core/services/auth.service';
import { UIService } from '../../core/services/ui.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Usuario } from '../../core/models/index';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private uiService = inject(UIService);

  usuario = signal<Usuario | null>(null);
  isCollapsed = this.uiService.isSidebarCollapsed;
  private destroy$ = new Subject<void>();

  toggleSidebar(): void {
    this.uiService.toggleSidebar();
  }

  ngOnInit(): void {
    this.sessionService.session$
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        this.usuario.set(session?.usuario || null);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    if (confirm('¿Deseas finalizar tu sesión actual?')) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/auth/login']),
        error: () => {
          this.sessionService.clearSession();
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}
