import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Competence } from '../Class/Competence';
import { CompetenceService } from '../Services/Competence.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viewcompetence',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewcompetence.html',
  styleUrl: './viewcompetence.css'
})
export class Viewcompetence implements OnInit {
  private competenceService = inject(CompetenceService);
  private router = inject(Router);

  competences = signal<Competence[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.loadCompetences();
  }

  goToDashboard(): void {
  this.router.navigate(['/Admin']); 
}


  loadCompetences() {
    this.loading.set(true);
    this.error.set(null);
    this.competenceService.getAllCompetences().subscribe({
      next: (data) => {
        this.competences.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur de chargement des compétences.');
        this.loading.set(false);
        Swal.fire('Erreur', 'Impossible de charger les compétences.', 'error');
      }
    });
  }

deleteCompetence(c: Competence) {
  if (typeof c.id !== 'number') {
    Swal.fire('Erreur', 'Impossible de supprimer : ID manquant.', 'error');
    return;
  }
  const id = c.id; 

  Swal.fire({
    title: `Supprimer ${c.nom} ${c.prenom} ?`,
    text: "Cette action est irréversible.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.loading.set(true);
      this.competenceService.deleteCompetence(id).subscribe({
        next: () => {
          this.competences.set(this.competences().filter(x => x.id !== id));
          this.loading.set(false);
          Swal.fire('Supprimé !', 'La compétence a été supprimée avec succès.', 'success');
        },
        error: (err) => {
          console.error(err);
          this.error.set('Erreur lors de la suppression.');
          this.loading.set(false);
          Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
        }
      });
    }
  });
}


  getFileUrl(fileName?: string | null) {
    return fileName ? this.competenceService.getFileUrl(fileName) : null;
  }
}
