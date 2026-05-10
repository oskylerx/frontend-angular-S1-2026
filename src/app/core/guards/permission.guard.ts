import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SessionService } from '../services/session.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  if (!sessionService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasPermission = sessionService.hasSomePermiso(requiredPermissions);

  if (!hasPermission) {
    router.navigate(['/error/403']);
    return false;
  }

  return true;
};
