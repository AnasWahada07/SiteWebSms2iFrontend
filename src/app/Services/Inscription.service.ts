import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://192.168.1.54:8082/api/inscriptions/formation';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {

  constructor(private http: HttpClient) {}

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/types`);
  }

  getFormationsByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/typeformations?type=${type}`);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${API_URL}`, data);
  }
}
