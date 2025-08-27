import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthResponse } from '../Class/AuthResponse';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://anas-wahada1997.alwaysdata.net/api/auth';
  private readonly STORAGE_KEY = 'currentUser';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password });
  }

  setUser(user: AuthResponse): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  getUser(): AuthResponse | null {
    if (!this.isBrowser()) return null;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.getUser()?.token || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(expectedRole: string): boolean {
    const user = this.getUser();
    return !!user && user.role?.trim().toLowerCase() === expectedRole.trim().toLowerCase();
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  resetPassword(email: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/sendresettoken`, { email }, { responseType: 'text' });
  }

  resetPasswordConfirm(token: string, newPassword: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/resetpassword`, { token, newPassword }, { responseType: 'text' });
  }
}
