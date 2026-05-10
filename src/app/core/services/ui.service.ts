import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }
}
