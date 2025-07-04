import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../Class/AuthResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth'; // ✅ corrigé ici

  constructor(private http: HttpClient) {}

  // ✅ Connexion
  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
  }

  // ✅ Demande de reset (envoi lien par mail)
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sendresettoken`, { email }, { responseType: 'text' });
  }

  // ✅ Réinitialisation avec le token
  resetPasswordConfirm(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resetpassword`, { token, newPassword }, { responseType: 'text' });

  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
