import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ViewFormationService, SujetPFE } from '../Services/ViewFormation.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-formation',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './view-formation.html',
  styleUrls: ['./view-formation.css']
})
export class ViewFormation implements OnInit {
  sujets: SujetPFE[] = [];
  selectedSujet: SujetPFE | null = null;

  searchQuery: string = '';
  sujetsOriginal: SujetPFE[] = [];

  currentYear: number = new Date().getFullYear();
  statutOptions = ['CONFIRMEE', 'EN_ATTENTE', 'REJETEE'];

  constructor(private service: ViewFormationService, private cdRef: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.loadSujets();
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  loadSujets(): void {
    this.service.getAllSujets().subscribe(data => {
      this.sujets = data;
      this.cdRef.detectChanges();
      this.sujetsOriginal = [...data];
    });
  }

  delete(id: number): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir supprimer ce sujet ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteSujet(id).subscribe({
          next: () => {
            this.sujets = this.sujets.filter(s => s.id !== id);
            if (this.selectedSujet?.id === id) this.selectedSujet = null;
            Swal.fire('Supprimé', 'Le sujet a été supprimé avec succès.', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
          }
        });
      }
    });
  }

  selectSujet(sujet: SujetPFE): void {
    this.selectedSujet = { ...sujet };
  }

  updateSelectedSujet(): void {
    if (!this.selectedSujet) return;

    this.service.updateSujet(this.selectedSujet.id, this.selectedSujet).subscribe({
      next: () => {
        Swal.fire('Mis à jour', 'Le sujet a été mis à jour avec succès.', 'success');
        this.loadSujets();
        this.selectedSujet = null;
      },
      error: () => {
        Swal.fire('Erreur', 'Échec de la mise à jour du sujet.', 'error');
      }
    });
  }

  applyGlobalFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.sujets = this.sujetsOriginal.filter(sujet =>
      (sujet.titre && sujet.titre.toLowerCase().includes(query)) ||
      (sujet.type && sujet.type.toLowerCase().includes(query)) ||
      (sujet.statut && sujet.statut.toLowerCase().includes(query)) ||
      (sujet.prixEncadrement && sujet.prixEncadrement.toString().includes(query))
    );
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.sujets = [...this.sujetsOriginal];
  }

  cancelEdit(): void {
    this.selectedSujet = null;
  }

  getFileUrl(fileName: string): string {
    return `http://192.168.1.54:8082/api/sujets/files/${fileName}`;
  }
}
