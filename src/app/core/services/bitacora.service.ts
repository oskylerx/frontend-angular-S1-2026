import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BitacoraRegistro, ApiResponse } from '../models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private apiUrl = `${environment.apiUrl}/bitacora`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los registros de bitácora
   */
  getAll(): Observable<ApiResponse<BitacoraRegistro>> {
    return this.http.get<ApiResponse<BitacoraRegistro>>(this.apiUrl);
  }

  /**
   * Obtener registros de bitácora de un usuario
   */
  getByUsuario(codigo: string): Observable<ApiResponse<BitacoraRegistro>> {
    return this.http.get<ApiResponse<BitacoraRegistro>>(`${this.apiUrl}/usuario/${codigo}`);
  }

  /**
   * Obtener registros de bitácora de un módulo
   */
  getByModulo(modulo: string): Observable<ApiResponse<BitacoraRegistro>> {
    return this.http.get<ApiResponse<BitacoraRegistro>>(`${this.apiUrl}/modulo/${modulo}`);
  }

  /**
   * Exportar bitácora por correo electrónico
   */
  exportByEmail(filters: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/export`, { filters });
  }
}
