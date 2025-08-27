import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../Class/Contact';


@Injectable({ providedIn: 'root' })
export class ContactService {
    private apiUrl = 'https://anas-wahada1997.alwaysdata.net/api/contact';

  constructor(private http: HttpClient) {}

sendMessage(contact: Contact): Observable<string> {
  return this.http.post(`${this.apiUrl}/send`, contact, { responseType: 'text' });
}

  getAllContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/allcontact`);
  }

  getContactById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/getcontact/${id}`);
  }

  updateContact(id: number, contact: Contact): Observable<string> {
    return this.http.put(`${this.apiUrl}/modifcontact/${id}`, contact, { responseType: 'text' });
  }

  deleteContact(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/deletecontact/${id}`, { responseType: 'text' });
  }

}
