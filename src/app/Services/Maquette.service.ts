import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PropositionMaquette } from '../Class/PropositionMaquette';
import { Observable } from 'rxjs';
import { DemandeMaquette } from '../Class/DemandeMaquette';

@Injectable({
  providedIn: 'root'
})
export class MaquetteService {

  private apiUrl = 'https://192.168.1.54:3350/api/maquettes'; 
  private apiUrls = 'https://192.168.1.54:3350/api/demandes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PropositionMaquette[]> {
    return this.http.get<PropositionMaquette[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<PropositionMaquette> {
    return this.http.get<PropositionMaquette>(`${this.apiUrl}/${id}`);
  }

  downloadFile(fichierNom: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${fichierNom}`, {
      responseType: 'blob'
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAlls(): Observable<DemandeMaquette[]> {
    return this.http.get<DemandeMaquette[]>(`${this.apiUrls}/getalldemande`);
  }

  getByIds(id: number): Observable<DemandeMaquette> {
    return this.http.get<DemandeMaquette>(`${this.apiUrls}/${id}`);
  }

  deletes(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrls}/${id}`);
  }
}


