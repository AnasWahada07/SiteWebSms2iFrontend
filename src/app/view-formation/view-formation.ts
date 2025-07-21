import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ViewFormationService, SujetPFE } from '../Services/ViewFormation.service';

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

  constructor(private service: ViewFormationService , private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSujets();
  }

  loadSujets(): void {
    this.service.getAllSujets().subscribe(data => {
      this.sujets = data;
        this.cdRef.detectChanges();
    this.sujetsOriginal = data;
   this.sujets = [...this.sujetsOriginal];

    });
  }

delete(id: number): void {
  const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer ce sujet ?');

  if (confirmDelete) {
    this.service.deleteSujet(id).subscribe(() => {
      this.sujets = this.sujets.filter(s => s.id !== id);

      if (this.selectedSujet?.id === id) {
        this.selectedSujet = null;
      }

      alert('Sujet supprimé avec succès.');
    }, error => {
      console.error('Erreur lors de la suppression:', error);
    });
  }
}

  selectSujet(sujet: SujetPFE): void {
    this.selectedSujet = { ...sujet };
  }

  updateSelectedSujet(): void {
    if (!this.selectedSujet) return;

    this.service.updateSujet(this.selectedSujet.id, this.selectedSujet).subscribe({
      next: () => {
        alert('Sujet mis à jour avec succès.');
        this.loadSujets();
        this.selectedSujet = null;
      },
      error: err => {
        console.error('Erreur update:', err);
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
