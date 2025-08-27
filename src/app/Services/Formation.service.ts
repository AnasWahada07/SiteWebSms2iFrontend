import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Formation } from '../formation/formation';
import { Observable } from 'rxjs';
import { FormationsParTypeDTO } from '../Class/FormationsParTypeDTO';
import { Formations } from '../Class/Formations';
import { InscriptionFormation } from '../Class/InscriptionFormation';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'https://anas-wahada1997.alwaysdata.net/api/formations';
  private baseUrl= 'https://anas-wahada1997.alwaysdata.net/api/inscriptions/formation';
  private urlParType = 'https://anas-wahada1997.alwaysdata.net/api/formations/confirmetype';

  constructor(private http: HttpClient) {}

  submitFormation(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation);
  }

  getFormationsParType(): Observable<FormationsParTypeDTO> {
    return this.http.get<FormationsParTypeDTO>(this.urlParType);
  }

  getAllFormations(): Observable<Formations[]> {
    return this.http.get<Formations[]>(`${this.apiUrl}/getallformation`);
  }

  updateFormation(id: number, formation: Formations): Observable<Formations> {
    return this.http.put<Formations>(`${this.apiUrl}/${id}`, formation);
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    getAll(): Observable<InscriptionFormation[]> {
    return this.http.get<InscriptionFormation[]>(this.baseUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

update(id: number, data: InscriptionFormation): Observable<any> {
  return this.http.put(`${this.baseUrl}/${id}`, data);
}




}
