import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GalerieService } from '../Services/Galerie.service';
import { Galeries } from '../Class/Galeries';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-galerie',
  imports: [

    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule



  ],
  templateUrl: './galerie.html',
  styleUrl: './galerie.css'
})
export class Galerie implements OnInit {

  currentYear: number = new Date().getFullYear();

  galeries: Galeries[] = [];
  searchTerm: string = '';


  constructor(private galerieService: GalerieService , private cdRef: ChangeDetectorRef) {}

ngOnInit(): void {
  this.galerieService.getAll().subscribe(data => {
    this.galeries = data;

    this.cdRef.detectChanges(); 
  });
}
filteredGaleries() {
  if (!this.searchTerm) return this.galeries;

  const lowerSearch = this.searchTerm.toLowerCase();
  return this.galeries.filter(g =>
    g.title.toLowerCase().includes(lowerSearch) ||
    g.client.toLowerCase().includes(lowerSearch)
  );
}





}