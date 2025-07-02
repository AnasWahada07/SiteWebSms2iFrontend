import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InscriptionPFE } from '../Class/InscriptionPFE';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class InscriptionPFEService {
  private apiUrl = 'http://localhost:8080/api/inscriptions';

  constructor(private http: HttpClient) {}

  createInscription(sujetId: number, inscription: InscriptionPFE): Observable<any> {
    return this.http.post(`${this.apiUrl}/sujet/${sujetId}`, inscription);
  }
}
