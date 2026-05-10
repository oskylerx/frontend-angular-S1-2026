import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permiso, ApiResponse, UsuarioPermiso } from '../models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private apiUrl = `${environment.apiUrl}/permisos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los permisos
   */
  getAll(): Observable<ApiResponse<Permiso>> {
    return this.http.get<ApiResponse<Permiso>>(this.apiUrl);
  }

  /**
   * Obtener permisos de un usuario
   */
  getPermisosPorUsuario(codigo: string): Observable<ApiResponse<Permiso>> {
    return this.http.get<ApiResponse<Permiso>>(`${this.apiUrl}/usuario/${codigo}`);
  }

  /**
   * Asignar permiso a usuario
   */
  asignarPermiso(codigo: string, request: UsuarioPermiso): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/usuario/${codigo}`, request);
  }

  /**
   * Quitar permiso de usuario
   */
  quitarPermiso(codigo: string, idPermiso: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/usuario/${codigo}/${idPermiso}`
    );
  }
}
