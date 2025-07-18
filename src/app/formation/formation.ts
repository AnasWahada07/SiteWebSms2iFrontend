import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  currentYear: number = new Date().getFullYear();

  formations!: FormationsParTypeDTO ;

    selectedFormation: any = null;


  constructor(private formationService: FormationService , private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.formationService.getFormationsParType().subscribe({
      next: data => this.formations = data,
      complete: () => this.cdRef.detectChanges(),
      error: err => console.error('Erreur chargement formations', err)
      
    });
  }

    openFormationDetails(formation: any): void {
    this.selectedFormation = formation;
  }
}

