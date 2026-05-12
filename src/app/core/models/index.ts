export interface Usuario {
  codigo: string;
  nombre: string;
  ci: string;
  rol: 'admin' | 'supervisor' | 'cajero';
  email: string;
  estado: boolean;
  fecha_creacion?: string;
  contrasena?: string;
}

export interface AuthResponse {
  success: boolean;
  mensaje: string;
  usuario: Usuario;
  token: string;
  permisos?: string[];
}

export interface Permiso {
  id: number;
  nombre: string;
  modulo: string;
  descripcion?: string;
}

export interface UsuarioPermiso {
  id_permiso: number;
}

export interface Proveedor {
  codigo: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: boolean;
  fecha_creacion?: string;
}

export interface Direccion {
  id?: number;
  codigo_cliente?: string;
  direccion: string;
  ciudad: string;
  es_principal: boolean;
}

export interface Contacto {
  id?: number;
  codigo_cliente?: string;
  nombre: string;
  telefono: string;
  cargo: string;
}

export interface Cliente {
  id: number;
  ci: string;
  nombre: string;
  correo_electronico: string;
  telefono: string;
  direcciones?: Direccion[];
  contactos?: Contacto[];
}

export interface Almacen {
  codigo: string;
  nombre: string;
  direccion: string;
  capacidad_actual: number;
  capacidad_total: number;
  estado: boolean;
  ubicaciones?: Ubicacion[];
  zonas?: Zona[];
}

export interface Ubicacion {
  id?: number;
  codigo_almacen: string;
  nombre: string;
  descripcion?: string;
}

export interface Zona {
  id?: number;
  codigo_almacen: string;
  nombre: string;
  capacidad: number;
}

export interface BitacoraRegistro {
  id?: number;
  codigo_usuario: string;
  modulo: string;
  accion: string;
  descripcion: string;
  ip: string;
  fecha: string;
}

export interface ApiResponse<T> {
  success: boolean;
  mensaje: string;
  data?: T;
  usuario?: Usuario;
  token?: string;
  usuarios?: T[];
  permisos?: T[];
  proveedores?: T[];
  clientes?: T[];
  cliente?: T;
  almacenes?: T[];
  almacen?: T;
  registros?: T[];
}

export interface SessionData {
  usuario: Usuario;
  token: string;
  permisos: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  codigo: string;
  nuevaContrasena: string;
}

export interface LoginRequest {
  codigo: string;
  contrasena: string;
}
