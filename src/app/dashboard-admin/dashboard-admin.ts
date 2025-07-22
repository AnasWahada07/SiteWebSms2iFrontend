import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthResponse } from '../Class/AuthResponse';
import { NotificationService, Notification } from '../Services/notification.service';
import { AuthService } from '../Services/ Auth.service';
import { FormsModule } from '@angular/forms';
import HijriDate from 'hijri-date/lib/safe';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdmin implements OnInit {
  adminName: string = 'Admin';
  currentDate: Date = new Date();
  currentDateFormatted: string = '';
  hijriDateFormatted: string = '';
  currentTime: string = '';
  weatherText = 'Chargement...';
  weatherIconUrl: string = '';
  sidebarOpen = false;

  searchNotifType: string = '';
  notificationsOriginal: Notification[] = [];
  notifications: Notification[] = [];
  allNotifications: Notification[] = [];
  unseenCount: number = 0;
  showDropdown: boolean = false;

      currentYear: number = new Date().getFullYear();

      isTimeOver: boolean = false;
      private hasTriggeredTimeout = false; 




  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user: AuthResponse | null = this.authService.getUser();
      if (user && user.prenom && user.nom) {
        this.adminName = `${user.prenom} ${user.nom}`;
      }

      this.updateCurrentTime();
      this.updateCurrentDate();

setInterval(() => {
  this.updateCurrentTime();
  this.updateCurrentDate();
}, 1000);

      this.loadNotifications();
      this.loadAllNotifications();
      this.loadWeather();

      setInterval(() => {
        this.loadNotifications();
      }, 10000);
    }
  }

updateCurrentTime(): void {
  const now = new Date();
  this.currentTime = now.toLocaleTimeString('fr-FR', {
    timeZone: 'Africa/Tunis',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Vérifier si c’est exactement l’heure cible
  if (this.currentTime === '15:00:00' && !this.hasTriggeredTimeout) {
    this.isTimeOver = true;
    this.hasTriggeredTimeout = true;

    setTimeout(() => {
      this.isTimeOver = false;
      this.hasTriggeredTimeout = false;
      this.cdr.detectChanges(); 
    }, 10000);
  }

  this.cdr.detectChanges();
}

  updateCurrentDate(): void {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Tunis'
    };
    this.currentDateFormatted = new Date().toLocaleDateString('fr-FR', options);

    const hijri = new HijriDate(); 
    const hijriDay = hijri.getDate();
    const hijriMonth = hijri.getMonth(); 
    const hijriYear = hijri.getFullYear();

    const hijriMonths = [
      'Muharram', 'Safar', 'Rabiʿ al-awwal', 'Rabiʿ al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Shaʿban',
      'Ramadan', 'Shawwal', 'Dhu al-Qiʿdah', 'Dhu al-Ḥijjah'
    ];

    this.hijriDateFormatted = `${hijriDay} ${hijriMonths[hijriMonth]} ${hijriYear} هـ`;
  }

  loadAllNotifications(): void {
    this.notificationService.getAllNotifications().subscribe((data) => {
      this.notificationsOriginal = data;
      this.allNotifications = [...this.notificationsOriginal].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }

  loadNotifications(): void {
    this.notificationService.getUnseenNotifications().subscribe((data) => {
      this.notifications = data;
      this.unseenCount = data.length;
      this.cdr.detectChanges();
    });
  }

  markNotificationAsSeen(notification: Notification): void {
    this.notificationService.markAsSeen(notification.id).subscribe(() => {
      this.loadNotifications();
      this.showDropdown = false;
    });
  }

  deleteNotification(notification: Notification): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.deleteNotification(notification.id).subscribe(() => {
        this.loadAllNotifications();
        this.loadNotifications();
      });
    }
  }

  filterNotifications(): void {
    const query = this.searchNotifType.toLowerCase().trim();
    this.allNotifications = this.notificationsOriginal.filter(notif =>
      notif.type?.toLowerCase().includes(query)
    );
  }

  resetNotifFilter(): void {
    this.searchNotifType = '';
    this.allNotifications = [...this.notificationsOriginal];
  }

  loadWeather(): void {
    this.notificationService.getCurrentWeather().subscribe({
      next: data => {
        this.weatherText = `${data.desc}, ${Math.round(data.temp)}°C`;
        this.weatherIconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
      },
      error: err => {
        console.error('❌ Erreur météo :', err);
        this.weatherText = 'Erreur de chargement météo';
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      localStorage.clear();
      if (rememberedEmail) {
        localStorage.setItem('rememberedEmail', rememberedEmail);
      }
      this.router.navigate(['/signin']);
    }
  }
}
