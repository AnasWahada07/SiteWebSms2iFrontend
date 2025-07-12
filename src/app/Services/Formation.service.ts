import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Formation } from '../formation/formation';
import { Observable } from 'rxjs';
import { FormationsParTypeDTO } from '../Class/FormationsParTypeDTO';




@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://192.168.1.54:8082/api/formations';

    private Url = 'http://192.168.1.54:8082/api/formations/confirmetype';


  constructor(private http: HttpClient) {}

  submitFormation(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation);
  }


  getFormationsParType(): Observable<FormationsParTypeDTO> {
    return this.http.get<FormationsParTypeDTO>(this.Url);
  }



}
