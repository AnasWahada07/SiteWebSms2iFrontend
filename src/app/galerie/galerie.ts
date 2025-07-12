import { Component, OnInit } from '@angular/core';
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

  galeries: Galeries[] = [];

  constructor(private galerieService: GalerieService) {}

  ngOnInit(): void {
    this.galerieService.getAll().subscribe(data => {
      console.log(data);
      this.galeries = data;
    });
  } 
}
