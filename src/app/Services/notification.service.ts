import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: string;
  createdAt: string;
  seen: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/notifications';
  private weatherApiKey = 'd4018802d6ad0ae758708a18a30c201b'
; 
  private city = 'Tunis'; 

  constructor(private http: HttpClient) {}

  // 🔔 Notification
  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/all`);
  }

  getUnseenNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/unseen`);
  }

  markAsSeen(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/markAsSeen/${id}`, {});
  }

  // 🌤 Météo
getCurrentWeather(): Observable<{ temp: number; desc: string; icon: string }> {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.weatherApiKey}&units=metric&lang=fr`;

  return this.http.get<any>(url).pipe(
    map(response => ({
      temp: response.main.temp,
      desc: response.weather[0].description,
      icon: response.weather[0].icon
    }))
  );
}
}
