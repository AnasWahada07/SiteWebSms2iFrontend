import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdmin implements OnInit {

  adminName: string = '';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const nom = localStorage.getItem('nom') || '';
      const prenom = localStorage.getItem('prenom') || '';

        console.log('NOM/PRENOM RÉCUPÉRÉS :', prenom, nom); // 🔍 DEBUG


      if (prenom || nom) {
        this.adminName = `${prenom} ${nom}`.trim();
      } else {
        this.adminName = localStorage.getItem('username') || 'Admin';
      }
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.router.navigate(['/signin']);
    }
  }
}
