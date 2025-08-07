import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PropositionMaquette } from '../Class/PropositionMaquette';
import { MaquetteService } from '../Services/Maquette.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DemandeMaquette } from '../Class/DemandeMaquette';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  constructor(
    private maquetteService: MaquetteService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMaquettes();
    this.chargerDemandes();
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  loadMaquettes(): void {
    this.maquetteService.getAll().subscribe({
      next: (data) => {
        this.maquettes = data;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur récupération maquettes :', err);
        Swal.fire('Erreur', 'Impossible de charger les maquettes.', 'error');
      }
    });
  }

  supprimerProposition(id: number): void {
    Swal.fire({
      title: 'Supprimer cette proposition ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.maquetteService.delete(id).subscribe({
          next: () => {
            this.loadMaquettes();
            Swal.fire('Supprimée', 'Proposition supprimée avec succès.', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Échec de la suppression.', 'error');
          }
        });
      }
    });
  }

  chargerDemandes(): void {
    this.maquetteService.getAlls().subscribe({
      next: data => {
        this.demandes = data;
        this.cdRef.detectChanges();
      },
      error: err => {
        console.error('Erreur chargement demandes :', err);
        Swal.fire('Erreur', 'Impossible de charger les demandes.', 'error');
      }
    });
  }

  supprimerDemande(id: number): void {
    Swal.fire({
      title: 'Supprimer cette demande ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.maquetteService.deletes(id).subscribe({
          next: () => {
            this.chargerDemandes();
            Swal.fire('Supprimée', 'Demande supprimée avec succès.', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Échec de la suppression.', 'error');
          }
        });
      }
    });
  }
}
