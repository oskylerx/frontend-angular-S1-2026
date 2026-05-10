import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor, ApiResponse } from '../models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los proveedores
   */
  getAll(): Observable<ApiResponse<Proveedor>> {
    return this.http.get<ApiResponse<Proveedor>>(this.apiUrl);
  }

  /**
   * Obtener proveedor por código
   */
  getByCode(codigo: string): Observable<ApiResponse<Proveedor>> {
    return this.http.get<ApiResponse<Proveedor>>(`${this.apiUrl}/${codigo}`);
  }

  /**
   * Crear nuevo proveedor
   */
  create(proveedor: Proveedor): Observable<ApiResponse<Proveedor>> {
    return this.http.post<ApiResponse<Proveedor>>(this.apiUrl, proveedor);
  }

  /**
   * Actualizar proveedor
   */
  update(codigo: string, proveedor: Partial<Proveedor>): Observable<ApiResponse<Proveedor>> {
    return this.http.put<ApiResponse<Proveedor>>(`${this.apiUrl}/${codigo}`, proveedor);
  }

  /**
   * Eliminar proveedor (lógico)
   */
  delete(codigo: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${codigo}`);
  }
}
