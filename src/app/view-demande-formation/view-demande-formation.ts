import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationService } from '../Services/Formation.service';
import { Formations } from '../Class/Formations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-demande-formation',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule, 
    MatOptionModule       
  ],
  templateUrl: './view-demande-formation.html',
  styleUrls: ['./view-demande-formation.css']
})
export class ViewDemandeFormation implements OnInit {

  formations: Formations[] = [];
  formationsOriginal: Formations[] = []; 
  selectedFormation: Formations | null = null;
  currentYear: number = new Date().getFullYear();
  searchQuery: string = '';

  displayedColumns: string[] = ['titre', 'formationType', 'theme', 'participants', 'statut', 'actions'];
  statutOptions: string[] = ['CONFIRMEE', 'EN_ATTENTE', 'REJETEE'];

  constructor(
    private formationService: FormationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchFormations();
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']); 
  }

  fetchFormations(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        this.formationsOriginal = data;
        this.formations = [...this.formationsOriginal];
      },
      complete: () => this.cdr.detectChanges(),
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les formations.', 'error');
      }
    });
  }

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.formations = this.formationsOriginal.filter(formation =>
      formation.titre?.toLowerCase().includes(query) ||
      formation.formationType?.toLowerCase().includes(query) ||
      formation.theme?.toLowerCase().includes(query)
    );
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  deleteFormation(id: number | undefined): void {
    if (!id) return;

    Swal.fire({
      title: 'Supprimer cette formation ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.formationService.deleteFormation(id).subscribe({
          next: () => {
            this.fetchFormations();
            Swal.fire('Supprimée', 'Formation supprimée avec succès.', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Impossible de supprimer la formation.', 'error');
          }
        });
      }
    });
  }

  selectFormation(formation: Formations): void {
    this.selectedFormation = { ...formation };
  }

  cancelEdit(): void {
    this.selectedFormation = null;
  }

  updateSelectedFormation() {
    if (this.selectedFormation && this.selectedFormation.id !== undefined) {
      this.selectedFormation.participants = Number(this.selectedFormation.participants);
      this.selectedFormation.proposerPrix = Number(this.selectedFormation.proposerPrix);

      this.formationService.updateFormation(
        this.selectedFormation.id,
        this.selectedFormation
      ).subscribe({
        next: () => {
          this.selectedFormation = null;
          this.fetchFormations();
          Swal.fire('Succès', 'Formation mise à jour avec succès.', 'success');
        },
        error: () => {
          Swal.fire('Erreur', 'Échec de la mise à jour de la formation.', 'error');
        }
      });
    } else {
      Swal.fire('Erreur', 'ID formation invalide.', 'error');
    }
  }  
}
