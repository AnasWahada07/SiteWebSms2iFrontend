import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Contact {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  consent: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = 'http://localhost:8080/send';

  constructor(private http: HttpClient) {}

  sendMessage(contact: Contact): Observable<any> {
    return this.http.post(this.apiUrl, contact);
  }
}
