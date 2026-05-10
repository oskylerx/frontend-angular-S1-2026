import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, ApiResponse } from '../models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios
   */
  getAll(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(this.apiUrl);
  }

  /**
   * Obtener usuario por código
   */
  getByCode(codigo: string): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${codigo}`);
  }

  /**
   * Crear nuevo usuario
   */
  create(usuario: Usuario): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, usuario);
  }

  /**
   * Actualizar usuario
   */
  update(codigo: string, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${codigo}`, usuario);
  }

  /**
   * Eliminar usuario (lógico)
   */
  delete(codigo: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${codigo}`);
  }
}
