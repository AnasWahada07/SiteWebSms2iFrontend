import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window === 'undefined') return true;

  const userStr = localStorage.getItem('currentUser');

  if (!userStr) {
    Swal.fire({
      icon: 'error',
      title: 'Accès refusé',
      text: 'Veuillez vous connecter.',
      confirmButtonText: 'OK'
    }).then(() => {
      router.navigate(['/signin']);
    });
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role?.toLowerCase() === 'admin') {
      Swal.fire({
        icon: 'success',
        title: 'Bienvenue',
        text: 'Accès administrateur autorisé.',
        timer: 1500,
        showConfirmButton: false
      });
      return true;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Vous devez être administrateur.',
        confirmButtonText: 'Retour'
      }).then(() => {
        router.navigate(['/acceuil']);
      });
      return false;
    }
  } catch (error) {
    console.error('Erreur parsing currentUser :', error);
    localStorage.removeItem('currentUser');
    Swal.fire({
      icon: 'error',
      title: 'Erreur de session',
      text: 'Session invalide. Veuillez vous reconnecter.',
      confirmButtonText: 'Se reconnecter'
    }).then(() => {
      router.navigate(['/signin']);
    });
    return false;
  }
};
