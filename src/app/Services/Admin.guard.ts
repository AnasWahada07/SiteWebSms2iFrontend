import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window === 'undefined') {
    return true;
  }

  const userStr = localStorage.getItem('currentUser');

  if (!userStr) {
    alert('⛔ Accès refusé : veuillez vous connecter.');
    router.navigate(['/signin']);
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role?.toLowerCase() === 'admin') {
      return true;
    } else {
      alert('⛔ Accès refusé : vous devez être administrateur.');
      router.navigate(['/acceuil']);
      return false;
    }
  } catch (error) {
    console.error('Erreur parsing currentUser :', error);
    localStorage.removeItem('currentUser');
    router.navigate(['/signin']);
    return false;
  }
};
