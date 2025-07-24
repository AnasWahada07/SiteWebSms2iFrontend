import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InscriptionPFE {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  classe: string;
  specialite: string;
  sujetTitre: string;
  etat: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViewInscriptionService {
  private apiUrl = 'http://192.168.1.54:8082/api/inscriptions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InscriptionPFE[]> {
    return this.http.get<InscriptionPFE[]>(this.apiUrl);
  }

  update(id: number, data: Partial<InscriptionPFE>): Observable<InscriptionPFE> {
    return this.http.put<InscriptionPFE>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number, options?: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}` , options);
  }

}
