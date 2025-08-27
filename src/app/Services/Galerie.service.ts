import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Galeries } from '../Class/Galeries';

@Injectable({
  providedIn: 'root'
})
export class GalerieService {
  private apiUrl = 'https://anas-wahada1997.alwaysdata.net/api/galeries';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Galeries[]> {
    return this.http.get<Galeries[]>(this.apiUrl);
  }

  getById(id: number): Observable<Galeries> {
    return this.http.get<Galeries>(`${this.apiUrl}/${id}`);
  }

  addGalerie(formData: FormData): Observable<Galeries> {
    return this.http.post<Galeries>(`${this.apiUrl}/add`, formData);
  }

  updateGalerie(id: number, formData: FormData): Observable<Galeries> {
    return this.http.put<Galeries>(`${this.apiUrl}/update/${id}`, formData);
  }

  deleteGalerie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
