import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Almacen, ApiResponse } from '../models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlmacenesService {
  private apiUrl = `${environment.apiUrl}/almacenes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Almacen>> {
    return this.http.get<ApiResponse<Almacen>>(this.apiUrl);
  }

  getByCodigo(codigo: string): Observable<ApiResponse<Almacen>> {
    return this.http.get<ApiResponse<Almacen>>(`${this.apiUrl}/${codigo}`);
  }

  search(term: string): Observable<ApiResponse<Almacen>> {
    return this.http.get<ApiResponse<Almacen>>(`${this.apiUrl}/buscar`, {
      params: { term }
    });
  }

  create(almacen: Partial<Almacen>): Observable<ApiResponse<Almacen>> {
    return this.http.post<ApiResponse<Almacen>>(this.apiUrl, almacen);
  }

  update(codigo: string, almacen: Partial<Almacen>): Observable<ApiResponse<Almacen>> {
    return this.http.put<ApiResponse<Almacen>>(`${this.apiUrl}/${codigo}`, almacen);
  }

  toggleEstado(codigo: string, estado: boolean): Observable<ApiResponse<Almacen>> {
    return this.http.patch<ApiResponse<Almacen>>(`${this.apiUrl}/${codigo}/estado`, { estado });
  }

  delete(codigo: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${codigo}`);
  }
}
