import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario, SessionData } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionSubject = new BehaviorSubject<SessionData | null>(null);
  public session$ = this.sessionSubject.asObservable();

  constructor() {
    this.loadSessionFromStorage();
  }

  /**
   * Cargar sesión desde localStorage
   */
  private loadSessionFromStorage(): void {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    const permisosStr = localStorage.getItem('permisos');

    if (token && usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      const permisos = permisosStr ? JSON.parse(permisosStr) : [];
      this.sessionSubject.next({ usuario, token, permisos });
    }
  }

  /**
   * Obtener sesión actual
   */
  getSession(): SessionData | null {
    return this.sessionSubject.getValue();
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return this.getSession()?.token || null;
  }

  /**
   * Obtener usuario actual
   */
  getUsuario(): Usuario | null {
    return this.getSession()?.usuario || null;
  }

  /**
   * Obtener permisos del usuario
   */
  getPermisos(): string[] {
    return this.getSession()?.permisos || [];
  }

  /**
   * Verificar si tiene permiso específico
   * Soporta chequeo flexible (ej: 'usuario.ver' o 'usuarios.ver')
   */
  hasPermiso(permiso: string): boolean {
    const usuario = this.getUsuario();
    if (usuario?.rol.toLowerCase() === 'admin') {
      return true;
    }
    
    // Si el permiso ya está en la lista exacto
    const userPerms = this.getPermisos();
    if (userPerms.includes(permiso.toLowerCase())) return true;

    // Chequeo flexible por si el backend usa plural y el frontend singular o viceversa
    const [module, action] = permiso.toLowerCase().split('.');
    return userPerms.some(p => {
      const [pModule, pAction] = p.split('.');
      if (pAction !== action) return false;
      
      // Remueve 's' final para comparar base
      const m1 = module.endsWith('s') ? module.slice(0, -1) : module;
      const m2 = pModule.endsWith('s') ? pModule.slice(0, -1) : pModule;
      return m1 === m2;
    });
  }

  hasSomePermiso(permisos: string[]): boolean {
    if (!permisos.length) {
      return true;
    }
    return permisos.some((permiso) => this.hasPermiso(permiso));
  }

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    return !!this.getSession();
  }

  /**
   * Establecer sesión
   */
  setSession(usuario: Usuario, token: string, permisos: string[] = []): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('permisos', JSON.stringify(permisos));
    this.sessionSubject.next({ usuario, token, permisos });
  }

  /**
   * Actualizar permisos
   */
  setPermisos(permisos: string[]): void {
    const session = this.getSession();
    if (session) {
      localStorage.setItem('permisos', JSON.stringify(permisos));
      this.sessionSubject.next({ ...session, permisos });
    }
  }

  /**
   * Limpiar sesión (logout)
   */
  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permisos');
    this.sessionSubject.next(null);
  }
}
