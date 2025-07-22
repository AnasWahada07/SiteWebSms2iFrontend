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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchFormations();
  }

  fetchFormations(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        this.formationsOriginal = data;
        this.formations = [...this.formationsOriginal];
      },
      complete: () => this.cdr.detectChanges(),
      error: (err) => console.error('❌ Erreur lors du chargement des formations :', err)
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
    if (id === undefined) {
      console.warn('⚠️ ID de formation introuvable.');
      return;
    }

    if (confirm('❗ Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => this.fetchFormations(),
        error: (err) => console.error('❌ Erreur lors de la suppression :', err)
      });
    }
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
        next: (res) => {
          console.log("✅ Formation mise à jour avec succès", res);
          this.selectedFormation = null;
          this.fetchFormations();
        },
        error: (err) => {
          console.error("❌ Erreur lors de la mise à jour :", err);
          alert("Erreur lors de la mise à jour.");
        }
      });
    } else {
      alert("ID formation invalide !");
    }
  }
}
