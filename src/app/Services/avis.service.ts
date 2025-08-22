import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avis } from '../Class/Avis';

@Injectable({ providedIn: 'root' })
export class AvisService {
  private http = inject(HttpClient);
  private baseUrl = `https://sitewebsms2ibackend-production.up.railway.app/api/avis`;

  list(): Observable<Avis[]> {
    return this.http.get<Avis[]>(this.baseUrl);
  }

  get(id: number): Observable<Avis> {
    return this.http.get<Avis>(`${this.baseUrl}/${id}`);
  }

  /** Création multipart (champs + fichier) */
  createMultipart(payload: Omit<Avis, 'id' | 'imageName'>, file?: File): Observable<Avis> {
    const fd = new FormData();
    fd.append('prenom', payload.prenom);
    fd.append('nom', payload.nom);
    fd.append('poste', payload.poste);
    fd.append('societe', payload.societe);
    fd.append('avis', payload.avis);
    if (payload.email) fd.append('email', payload.email);
    if (file) fd.append('file', file);
    return this.http.post<Avis>(this.baseUrl, fd);
  }

  /** Mise à jour JSON (sans image) */
  update(id: number, payload: Partial<Avis>): Observable<Avis> {
    return this.http.put<Avis>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Remplacement de l'image */
  uploadImage(id: number, file: File): Observable<Avis> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<Avis>(`${this.baseUrl}/${id}/image`, fd);
  }

  /** URL publique de l'image servie par le backend */
  imageUrl(imageName?: string | null): string | null {
    if (!imageName) return null;
    return `${this.baseUrl}/files/${encodeURIComponent(imageName)}`;
  }
}
