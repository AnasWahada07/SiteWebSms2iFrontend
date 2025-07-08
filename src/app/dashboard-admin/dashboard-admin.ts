import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthResponse } from '../Class/AuthResponse';
import { NotificationService, Notification } from '../Services/notification.service';
import { AuthService } from '../Services/ Auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdmin implements OnInit {
  adminName: string = 'Admin';
  currentDate: Date = new Date();
  weatherText = 'Chargement...';
  weatherIconUrl: string = '';

  notifications: Notification[] = [];
  allNotifications: Notification[] = [];
  unseenCount: number = 0;
  showDropdown: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user: AuthResponse | null = this.authService.getUser();
      if (user && user.prenom && user.nom) {
        this.adminName = `${user.prenom} ${user.nom}`;
        console.log('NOM/PRENOM RÉCUPÉRÉS :', this.adminName);
      } else {
        this.adminName = 'Admin';
      }

      this.loadNotifications();
      this.loadAllNotifications();
      this.loadWeather();
    }
  }

  loadAllNotifications(): void {
    this.notificationService.getAllNotifications().subscribe((data) => {
      this.allNotifications = data;
    });
  }

  loadNotifications(): void {
    this.notificationService.getUnseenNotifications().subscribe((data) => {
      this.notifications = data;
      this.unseenCount = data.length;
    });
  }

  markNotificationAsSeen(notification: Notification): void {
    this.notificationService.markAsSeen(notification.id).subscribe(() => {
      this.loadNotifications();
      this.showDropdown = false;
    });
  }

loadWeather(): void {
  this.notificationService.getCurrentWeather().subscribe({
    next: data => {
      this.weatherText = `${data.desc}, ${Math.round(data.temp)}°C`;
      this.weatherIconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    },
    error: err => {
      console.error('❌ Erreur météo :', err); // ← VOIR L'ERREUR EXACTE ICI
      this.weatherText = 'Erreur de chargement météo';
    }
  });
}

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.router.navigate(['/signin']);
    }
  }
}
