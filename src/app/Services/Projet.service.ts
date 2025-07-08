import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../Class/Projet';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

  private apiUrl = 'http://localhost:8080/api/projets';
  private getAllUrl = `${this.apiUrl}/gettallprojets`; 

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les projets (aucun header nécessaire)
   */
  getAllProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.getAllUrl);
  }

  /**
   * Ajouter un projet avec une image (multipart/form-data)
   */
  createProjetWithImage(formData: FormData): Observable<Projet> {
    return this.http.post<Projet>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Modifier un projet avec une nouvelle image ou non
   */
  updateProjetWithImage(id: number, formData: FormData): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/upload/${id}`, formData);
  }

  /**
   * Supprimer un projet par ID
   */
  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
