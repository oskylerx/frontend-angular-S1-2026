import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/guards';
import { LoginComponent } from './features/auth/login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password.component';
import { DashboardComponent } from './features/dashboard.component';
import { UsuariosListComponent } from './features/usuarios/usuarios-list.component';
import { UsuariosFormComponent } from './features/usuarios/usuarios-form.component';
import { PermisosComponent } from './features/permisos/permisos.component';
import { ProveedoresListComponent } from './features/proveedores/proveedores-list.component';
import { ProveedoresFormComponent } from './features/proveedores/proveedores-form.component';
import { BitacoraComponent } from './features/bitacora/bitacora.component';
import { ClientesListComponent } from './features/clientes/clientes-list.component';
import { ClientesFormComponent } from './features/clientes/clientes-form.component';
import { AlmacenesListComponent } from './features/almacenes/almacenes-list.component';
import { AlmacenesFormComponent } from './features/almacenes/almacenes-form.component';
import { Error403Component } from './features/error/error-403.component';
import { Error404Component } from './features/error/error-404.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  // Rutas de autenticación (sin layout)
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent }
    ]
  },

  // Rutas protegidas con layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      
      // Usuarios
      {
        path: 'usuarios',
        component: UsuariosListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['usuario.ver'] }
      },
      {
        path: 'usuarios/crear',
        component: UsuariosFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['usuario.crear'] }
      },
      {
        path: 'usuarios/editar/:codigo',
        component: UsuariosFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['usuario.editar'] }
      },

      // Permisos
      {
        path: 'permisos',
        component: PermisosComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['permiso.ver'] }
      },

      // Proveedores
      {
        path: 'proveedores',
        component: ProveedoresListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['proveedor.ver'] }
      },
      {
        path: 'proveedores/crear',
        component: ProveedoresFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['proveedor.crear'] }
      },
      {
        path: 'proveedores/editar/:codigo',
        component: ProveedoresFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['proveedor.editar'] }
      },

      // Bitácora
      {
        path: 'bitacora',
        component: BitacoraComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['bitacora.ver'] }
      },

      // Clientes
      {
        path: 'clientes',
        component: ClientesListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['cliente.ver'] }
      },
      {
        path: 'clientes/nuevo',
        component: ClientesFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['cliente.crear'] }
      },
      {
        path: 'clientes/editar/:codigo',
        component: ClientesFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['cliente.editar'] }
      },

      // Almacenes
      {
        path: 'almacenes',
        component: AlmacenesListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['almacen.ver'] }
      },
      {
        path: 'almacenes/nuevo',
        component: AlmacenesFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['almacen.crear'] }
      },
      {
        path: 'almacenes/editar/:codigo',
        component: AlmacenesFormComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['almacen.editar'] }
      }
    ]
  },

  // Rutas de error
  { path: 'error/403', component: Error403Component },
  { path: 'error/404', component: Error404Component },

  // Redirect al login para rutas desconocidas
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', component: Error404Component }
];