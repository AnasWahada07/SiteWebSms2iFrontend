import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competence } from '../Class/Competence';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
  private apiUrl = 'http://localhost:8080/api/competences'; // adapte si nécessaire

  constructor(private http: HttpClient) {}

  addCompetence(formData: FormData) {
    return this.http.post(this.apiUrl, formData);
  }

  getAllCompetences() {
    return this.http.get(this.apiUrl);
  }
}
