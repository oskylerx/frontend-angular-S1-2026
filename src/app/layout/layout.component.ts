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
    <div class="app-layout">
      <app-navbar></app-navbar>
      <div class="layout-container">
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
    }
    .layout-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 2.5rem;
      margin-left: 260px; /* Ancho sidebar expandido */
      position: relative;
      background: #f8fafc;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-content.collapsed {
      margin-left: 88px; /* Ancho sidebar contraído */
    }

    @media (max-width: 768px) {
      .layout-container {
        flex-direction: column;
      }
      .main-content {
        padding: 1.5rem;
        margin-left: 0 !important;
      }
    }
  `]
})
export class LayoutComponent {
  private uiService = inject(UIService);
  isCollapsed = this.uiService.isSidebarCollapsed;
}
