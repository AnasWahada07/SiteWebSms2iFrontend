import { ChangeDetectorRef, Component } from '@angular/core';
import { InscriptionFormation } from '../Class/InscriptionFormation';
import { FormationService } from '../Services/Formation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-inscrit-formation',
  imports: [CommonModule , FormsModule], 
  templateUrl: './view-inscrit-formation.html',
  styleUrl: './view-inscrit-formation.css'
})
export class ViewInscritFormation {

  inscriptions: InscriptionFormation[] = [];

inscriptionsOriginal: InscriptionFormation[] = []; 
filteredInscriptions: InscriptionFormation[] = []; 

searchText: string = '';
selectedEtat: string = '';

  constructor(private inscriptionService: FormationService , private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadInscriptions();

  }

loadInscriptions(): void {
  this.inscriptionService.getAll().subscribe(data => {
    this.inscriptionsOriginal = data; 
    this.filteredInscriptions = [...this.inscriptionsOriginal];
    this.cdRef.detectChanges();
  });
}

applyFilters(): void {
  const search = this.searchText.toLowerCase().trim();

  this.filteredInscriptions = this.inscriptionsOriginal.filter(insc => {
    const matchEtat = !this.selectedEtat || insc.etat === this.selectedEtat;
    const matchTexte =
      insc.nom?.toLowerCase().includes(search) ||
      insc.prenom?.toLowerCase().includes(search) ||
      insc.formation?.titre?.toLowerCase().includes(search);

    return matchEtat && matchTexte;
  });
}

resetFilters(): void {
  this.searchText = '';
  this.selectedEtat = '';
  this.filteredInscriptions = [...this.inscriptionsOriginal];
}


deleteInscription(id?: number): void {
  if (!id) return;

  if (confirm('Confirmer la suppression ?')) {
    this.inscriptionService.delete(id).subscribe(() => {
      this.inscriptionsOriginal = this.inscriptionsOriginal.filter(insc => insc.id !== id);
      this.applyFilters(); // réappliquer les filtres à jour
    });
  }
}
  }

