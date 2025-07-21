import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PropositionMaquette } from '../Class/PropositionMaquette';
import { MaquetteService } from '../Services/Maquette.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DemandeMaquette } from '../Class/DemandeMaquette';

@Component({
  selector: 'app-maquette',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './maquette.html',
  styleUrl: './maquette.css'
})
export class Maquette implements OnInit {
  maquettes: PropositionMaquette[] = [];
  demandes: DemandeMaquette[] = [];
        currentYear: number = new Date().getFullYear();


  constructor(private maquetteService: MaquetteService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadMaquettes();
    this.chargerDemandes();
  }

  loadMaquettes(): void {
    this.maquetteService.getAll().subscribe({
      next: (data) => {
        this.maquettes = data;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error("Erreur récupération maquettes :", err)
    });
  }

supprimerProposition(id: number): void {
  if (confirm('Voulez-vous vraiment supprimer cette proposition ?')) {
    this.maquetteService.delete(id).subscribe(() => {
      this.loadMaquettes();
    });
  }
}


  chargerDemandes(): void {
    this.maquetteService.getAlls().subscribe({
      next: data => {
        this.demandes = data;
        this.cdRef.detectChanges();
      },
      error: err => console.error('Erreur chargement demandes :', err)
    });
  }

supprimerDemande(id: number): void {
  if (confirm('Voulez-vous vraiment supprimer cette demande ?')) {
    this.maquetteService.deletes(id).subscribe(() => {
      this.chargerDemandes();
    });
  }
}
}


