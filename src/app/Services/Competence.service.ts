import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competence } from '../Class/Competence';

@Injectable({ providedIn: 'root' })
export class CompetenceService {
  // base API (prod Railway – adapte si besoin)
  private apiUrl = 'https://sitewebsms2ibackend-production.up.railway.app/api/competences';

  constructor(private http: HttpClient) {}

  /** POST /api/competences (multipart) */
  addCompetence(formData: FormData): Observable<Competence> {
    return this.http.post<Competence>(this.apiUrl, formData);
  }

  /** GET /api/competences/getallcompetence */
  getAllCompetences(): Observable<Competence[]> {
    return this.http.get<Competence[]>(`${this.apiUrl}/getallcompetence`);
  }

  /** DELETE /api/competences/{id} */
  deleteCompetence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** URL direct du CV (si tu veux un simple <a [href]> …) */
  getCvUrl(id: number): string {
    return `${this.apiUrl}/${id}/cv`;
  }

  /** Téléchargement Blob (utile si tu as besoin d’Authorization, etc.) */
  downloadCv(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/cv`, { responseType: 'blob' });
  }

  getFileUrl(fileName: string) {
  return `${this.apiUrl}/files/${encodeURIComponent(fileName)}`;
}

}
