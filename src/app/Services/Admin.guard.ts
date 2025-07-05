import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './ Auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();
  const isAdmin = !!user && user.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    console.warn('⛔ Accès refusé : utilisateur non administrateur.');
    return router.createUrlTree(['/signin']); // ✅ Redirection propre
  }

  return true;
};
