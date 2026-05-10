import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { 
  AuthResponse, 
  LoginRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  ApiResponse
} from '../models/index';
import { SessionService } from './session.service';
import { PermisosService } from './permisos.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private permisosService: PermisosService
  ) {}

  /**
   * Login
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        if (!response.success || !response.usuario || !response.token) {
          return;
        }

        // Cargamos la sesión con todos sus datos (usuario, token y permisos)
        this.sessionService.setSession(
          response.usuario, 
          response.token, 
          response.permisos || []
        );
      })
    );
  }

  /**
   * Logout
   */
  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.sessionService.clearSession();
      })
    );
  }

  /**
   * Solicitar recuperación de contraseña
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/forgot-password`, request);
  }

  /**
   * Restablecer contraseña
   */
  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/reset-password`, request);
  }
}
