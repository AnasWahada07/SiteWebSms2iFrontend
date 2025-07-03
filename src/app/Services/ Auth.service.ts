import { Injectable } from '@angular/core';
import { AuthResponse } from '../Class/AuthResponse';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
  }

resetPassword(email: string): Observable<string> {
  return this.http.post('http://localhost:8080/api/auth/sendresettoken', { email }, { responseType: 'text' });
}

updatePassword(token: string, newPassword: string) {
  return this.http.post('http://localhost:8080/api/auth/resetpassword', {
    token,
    newPassword
  }, { responseType: 'text' });
}


  logout() {
    localStorage.clear();
  }

  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
