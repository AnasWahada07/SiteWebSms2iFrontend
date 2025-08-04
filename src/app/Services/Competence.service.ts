import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competence } from '../Class/Competence';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
  private apiUrl = 'https://192.168.1.54:3350/api/competences'; 

  constructor(private http: HttpClient) {}

  addCompetence(formData: FormData): Observable<Competence> {
    return this.http.post<Competence>(this.apiUrl, formData);
  }
  getAllCompetences() {
    return this.http.get(this.apiUrl);
  }
}
