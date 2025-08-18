import { Injectable } from '@angular/core';
import { ViewFormation } from '../view-formation/view-formation';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

Injectable({
  providedIn: 'root'
})
export interface SujetPFE {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  titre: string;
  description: string;
  type: string;
  statut: string;
  prixEncadrement: string;
  fileName?: string;
  fileUrl?: string;
  nombreInscription?: number;
  profil: string;
  technologie: string;
}

@Injectable({ providedIn: 'root' })
export class ViewFormationService {
  private apiUrl = 'https://sitewebsms2ibackend-production.up.railway.app/api/sujets';

  constructor(private http: HttpClient) {}

  getAllSujets(): Observable<SujetPFE[]> {
    return this.http.get<SujetPFE[]>(`${this.apiUrl}/getallpfe`);
  }
  

  deleteSujet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateSujet(id: number, sujet: SujetPFE): Observable<SujetPFE> {
    return this.http.put<SujetPFE>(`${this.apiUrl}/${id}`, sujet);
  }
}
