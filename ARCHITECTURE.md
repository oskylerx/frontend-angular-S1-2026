# 🏗️ Arquitectura Frontend - Mini Market

## 📋 Descripción General

Este es un frontend moderno construido con **Angular 21.2** usando standalone components, siguiendo una arquitectura feature-first escalable y profesional.

## 📁 Estructura del Proyecto

```
src/app/
├── core/                           # Módulo core - servicios, guards, interceptors
│   ├── guards/
│   │   ├── auth.guard.ts          # Guard para proteger rutas autenticadas
│   │   ├── permission.guard.ts    # Guard para verificar permisos específicos
│   │   └── index.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    # Inyecta token JWT en todas las peticiones
│   │   └── index.ts
│   ├── services/
│   │   ├── session.service.ts     # Maneja sesión del usuario en localStorage
│   │   ├── auth.service.ts        # Login, logout, forgot-password, reset-password
│   │   ├── usuarios.service.ts    # CRUD de usuarios
│   │   ├── permisos.service.ts    # Gestión de permisos
│   │   ├── proveedores.service.ts # CRUD de proveedores
│   │   ├── bitacora.service.ts    # Consulta de bitácora
│   │   └── index.ts
│   └── models/
│       └── index.ts               # Interfaces y tipos TypeScript
│
├── shared/                         # Componentes y utilidades compartidas
│   ├── components/
│   │   ├── navbar.component.ts    # Barra superior con usuario y logout
│   │   ├── sidebar.component.ts   # Menú lateral con filtro de permisos
│   │   ├── alert.component.ts     # Componente de alertas reutilizable
│   │   ├── confirm-dialog.component.ts
│   │   └── index.ts
│   └── utils/
│
├── features/                       # Features/módulos funcionales
│   ├── auth/
│   │   ├── login.component.ts     # Página de login
│   │   ├── forgot-password.component.ts
│   │   └── reset-password.component.ts
│   ├── dashboard.component.ts     # Dashboard inicial
│   ├── usuarios/
│   │   ├── usuarios-list.component.ts   # Listado con búsqueda
│   │   └── usuarios-form.component.ts   # Crear/Editar
│   ├── permisos/
│   │   └── permisos.component.ts  # Gestión de permisos por usuario
│   ├── proveedores/
│   │   ├── proveedores-list.component.ts
│   │   └── proveedores-form.component.ts
│   ├── bitacora/
│   │   └── bitacora.component.ts  # Auditoría con filtros
│   └── error/
│       ├── error-403.component.ts # Página sin permisos
│       └── error-404.component.ts # Página no encontrada
│
├── layout/
│   └── layout.component.ts        # Layout principal (navbar + sidebar)
│
├── app.routes.ts                  # Definición de rutas
├── app.config.ts                  # Configuración de aplicación
├── app.ts                         # Componente raíz
├── app.css                        # Estilos globales
└── app.html                       # Template raíz

src/
├── index.html
├── main.ts                        # Punto de entrada
└── styles.css                     # Estilos globales (si es necesario)
```

## 🔑 Características Principales

### 🔐 Autenticación y Autorización
- **Login**: Formulario reactivo con código y contraseña
- **Forgot Password**: Solicitud de código de recuperación
- **Reset Password**: Restablecimiento de contraseña
- **JWT**: Token almacenado en localStorage
- **SessionService**: Gestión centralizada de sesión
- **Auth Guard**: Protección de rutas autenticadas
- **Permission Guard**: Control de acceso por permisos

### 📊 Características de Aplicación

#### 1. **Dashboard**
- Visualización de estado de sesión
- Accesos rápidos filtrados por permisos
- Información del sistema

#### 2. **Usuarios**
- Listado con búsqueda en tiempo real
- Crear usuario
- Editar usuario (con cambio opcional de contraseña)
- Eliminar usuario (lógico)
- Validaciones de formulario
- Badges de rol y estado

#### 3. **Permisos**
- Listado de permisos disponibles
- Selección de usuario
- Asignación de permisos
- Remoción de permisos
- Visualización de permisos actuales

#### 4. **Proveedores**
- CRUD completo
- Búsqueda de proveedores
- Formulario reactivo con validación
- Estados activo/inactivo

#### 5. **Bitácora**
- Visualización de auditoría
- Filtro por usuario
- Filtro por módulo
- Ordenamiento por fecha descendente
- Badges visuales por tipo de acción

### 🎨 Componentes Reutilizables

- **AlertComponent**: Alertas de éxito, error, warning, info
- **ConfirmDialogComponent**: Modal de confirmación para eliminaciones
- **NavbarComponent**: Barra superior con usuario y logout
- **SidebarComponent**: Menú lateral con filtro dinámico de permisos

### 🛡️ Seguridad

1. **AuthInterceptor**: Inyecta automáticamente el token JWT en cada petición
2. **Token Management**: Almacenamiento seguro en localStorage
3. **Redireccionamiento**: Logout automático si falla 401
4. **Permission-based UI**: Menú y rutas filtradas según permisos

## 🚀 Guía de Uso

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm start
```
La aplicación se ejecutará en `http://localhost:4200`

### Build
```bash
npm run build
```

## 📱 Características de Diseño

- **Responsive**: Optimizado para desktop, tablet y móvil
- **Modern UI**: Interfaz limpia y profesional
- **Accesibilidad**: Formularios con etiquetas y validaciones
- **Feedback Visual**: Estados de carga, alertas, confirmaciones
- **Animaciones**: Transiciones suaves y agradables

## 🔗 URLs Principales

- `/auth/login` - Login
- `/auth/forgot-password` - Recuperar contraseña
- `/auth/reset-password` - Restablecer contraseña
- `/dashboard` - Dashboard inicial
- `/usuarios` - Gestión de usuarios
- `/permisos` - Gestión de permisos
- `/proveedores` - Gestión de proveedores
- `/bitacora` - Bitácora de auditoría
- `/error/403` - Sin permisos
- `/error/404` - Página no encontrada

## 🔌 Integración con Backend

El frontend consume una API REST en `http://localhost:3000/api` con los siguientes endpoints:

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Usuarios
- `GET /api/usuarios`
- `GET /api/usuarios/:codigo`
- `POST /api/usuarios`
- `PUT /api/usuarios/:codigo`
- `DELETE /api/usuarios/:codigo`

### Permisos
- `GET /api/permisos`
- `GET /api/permisos/usuario/:codigo`
- `POST /api/permisos/usuario/:codigo`
- `DELETE /api/permisos/usuario/:codigo/:idPermiso`

### Proveedores
- `GET /api/proveedores`
- `GET /api/proveedores/:codigo`
- `POST /api/proveedores`
- `PUT /api/proveedores/:codigo`
- `DELETE /api/proveedores/:codigo`

### Bitácora
- `GET /api/bitacora`
- `GET /api/bitacora/usuario/:codigo`
- `GET /api/bitacora/modulo/:modulo`

## 🎯 Mejores Prácticas Implementadas

1. **Standalone Components**: Sin NgModules, más simples y directos
2. **Lazy Loading**: Carga perezosa de rutas cuando sea aplicable
3. **Reactive Forms**: FormBuilder y validadores avanzados
4. **RxJS**: Suscripciones con takeUntil para evitar memory leaks
5. **Type Safety**: Interfaces y tipos definidos
6. **Service Layer**: Lógica separada del componente
7. **Error Handling**: Manejo centralizado de errores
8. **Guard Pattern**: Protección de rutas por autenticación y permisos
9. **Component Composition**: Componentes pequeños y reutilizables
10. **CSS Modular**: Estilos encapsulados en componentes

## 🔄 Flujo de Autenticación

1. Usuario ingresa credenciales en `/auth/login`
2. AuthService llama a `POST /api/auth/login`
3. Backend retorna usuario, token y permisos
4. SessionService almacena en localStorage
5. Se redirige a `/dashboard`
6. AuthInterceptor inyecta token en todas las peticiones
7. Si token expira (401), se redirige a login

## 📝 Notas Importantes

- La aplicación asume permisos en formato `"modulo.accion"` (ej: `usuario.crear`)
- El token JWT debe tener duración apropiada en backend
- Los permisos se cargan en la sesión al login
- El menú lateral se actualiza dinámicamente según permisos
- Las rutas están protegidas tanto por authGuard como por permissionGuard

## 🐛 Troubleshooting

### "No estoy autenticado"
- Revisa que el token esté en localStorage
- Verifica que el backend devuelva el token correctamente
- Comprueba la duración del token

### "No veo ciertos menús"
- Verifica que los permisos estén correctamente asignados en el backend
- Revisa la consola para ver qué permisos tiene el usuario

### "Error 401 en peticiones"
- El token puede haber expirado
- Verifica que AuthInterceptor está registrado
- Comprueba la URL del backend en los servicios

## 📚 Tecnologías Utilizadas

- **Angular 21.2**: Framework principal
- **TypeScript 5.9**: Lenguaje de programación
- **RxJS 7.8**: Programación reactiva
- **Reactive Forms**: Formularios avanzados
- **CSS3**: Estilos sin frameworks pesados

---

**Autor**: Senior Frontend Architect  
**Fecha**: 2026  
**Versión**: 1.0.0  
**Estado**: Producción
