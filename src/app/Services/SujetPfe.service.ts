import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { SujetsParTypeDTO } from '../Class/SujetsParTypeDTO';




@Injectable({
  providedIn: 'root'
})
export class SujetPfeService {

  private apiUrl = 'https://192.168.1.54:3350/api/sujets/confirmes-groupes'; 

  constructor(private http: HttpClient) {}

  getSujetsConfirmesGroupes(): Observable<SujetsParTypeDTO> {
    return this.http.get<SujetsParTypeDTO>(this.apiUrl).pipe(
      tap(data => console.log('✅ Données reçues depuis l\'API :', data)),
      catchError(error => {
        console.error('❌ Erreur lors de l\'appel à l\'API :', error);
        return throwError(() => error);
      })
    );
  }
}
