import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-service',
  imports: [CommonModule],
  templateUrl: './service.html',
  styleUrl: './service.css'
})
export class Service {

  currentYear: number = new Date().getFullYear();
  startYear: number = 2008; 
  experienceYears: number = this.currentYear - this.startYear;
  isNavbarCollapsed: boolean = true;


    toggleSidebar(): void {
  this.isNavbarCollapsed = !this.isNavbarCollapsed;
}



}
