import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../Class/AuthResponse';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient , @Inject(PLATFORM_ID) private platformId: Object) {}

  // ✅ Vérifie si on est dans le navigateur (protection SSR)
  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ✅ Connexion + stockage
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((response: AuthResponse) => {
        console.log('🔑 Réponse backend au login:', response);
        this.setUser({
          email: response.email,
          role: response.role,
          token: response.token
        });
      })
    );
  }

  // ✅ Stocke utilisateur dans localStorage
  setUser(user: { email: string; role: string; token: string }): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // ✅ Récupère l'utilisateur
getUser(): { email: string; role: string; token: string } | null {
  try {
    if (typeof localStorage === 'undefined') return null; 
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    return null;
  }
}
  // ✅ Vérifie si admin
  isAdmin(): boolean {
    const user = this.getUser();
    return !!user && user.role?.toLowerCase() === 'admin';
  }

  // ✅ Vérifie si connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ Récupère le token
  getToken(): string | null {
    const user = this.getUser();
    return user?.token || null;
  }

  // ✅ Profil complet
  getLoggedUser(): Partial<AuthResponse> | null {
    return this.getUser();
  }

  // ✅ Déconnexion
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('currentUser');
    }
  }

  // ✅ Email reset password
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sendresettoken`, { email }, { responseType: 'text' });
  }

  // ✅ Réinit avec token
  resetPasswordConfirm(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resetpassword`, { token, newPassword }, { responseType: 'text' });
  }
}
