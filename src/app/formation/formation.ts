import { Component, OnInit } from '@angular/core';
import { FormationService } from '../Services/Formation.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormationsParTypeDTO } from '../Class/FormationsParTypeDTO';


@Component({
  selector: 'app-formation',
    standalone: true,
  imports: [ReactiveFormsModule, 
    FormsModule,
     CommonModule,
      HttpClientModule],
  templateUrl: './formation.html',
  styleUrl: './formation.css'
})
export class Formation implements OnInit {

  formations!: FormationsParTypeDTO ;

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.formationService.getFormationsParType().subscribe({
      next: data => this.formations = data,
      error: err => console.error('Erreur chargement formations', err)
    });
  }
}

