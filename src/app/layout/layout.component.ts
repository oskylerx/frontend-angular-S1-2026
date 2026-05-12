import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar.component';
import { SidebarComponent } from '../shared/components/sidebar.component';
import { UIService } from '../core/services/ui.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-layout" [class.collapsed]="isCollapsed()">
      <app-navbar></app-navbar>
      <div class="layout-container">
        <!-- Overlay para móvil cuando el sidebar está abierto (no colapsado) -->
        <div 
          class="sidebar-overlay" 
          *ngIf="!isCollapsed()" 
          (click)="toggleSidebar()">
        </div>

        <app-sidebar></app-sidebar>
        
        <main class="main-content" [class.collapsed]="isCollapsed()">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f8fafc;
      position: relative;
    }
    .layout-container {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      margin-left: 260px;
      background: #f8fafc;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-content.collapsed {
      margin-left: 88px;
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px);
      z-index: 999; /* Justo debajo del sidebar */
      animation: fadeIn 0.2s ease-out;
    }

    @media (max-width: 1024px) {
      .main-content {
        margin-left: 0 !important;
        padding: 1rem;
      }
      
      .sidebar-overlay {
        display: block;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class LayoutComponent {
  private uiService = inject(UIService);
  isCollapsed = this.uiService.isSidebarCollapsed;

  toggleSidebar(): void {
    this.uiService.toggleSidebar();
  }
}
