import { ChangeDetectorRef, Component } from '@angular/core';
import { InscriptionFormation } from '../Class/InscriptionFormation';
import { FormationService } from '../Services/Formation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


declare var bootstrap: any;

@Component({
  selector: 'app-view-inscrit-formation',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-inscrit-formation.html',
  styleUrl: './view-inscrit-formation.css'
})
export class ViewInscritFormation {

  inscriptions: InscriptionFormation[] = [];
  inscriptionsOriginal: InscriptionFormation[] = [];
  filteredInscriptions: InscriptionFormation[] = [];

  searchText: string = '';
  selectedEtat: string = '';
  currentYear: number = new Date().getFullYear();

  groupedInscriptions: { [titre: string]: InscriptionFormation[] } = {};

  constructor(
    private inscriptionService: FormationService,
    private cdRef: ChangeDetectorRef
  ) {}

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
        this.applyFilters();
      });
    }
  }

  openGroupedModal(): void {
    this.groupedInscriptions = {};

    for (const insc of this.filteredInscriptions) {
      const titre = insc.formation?.titre || 'Formation inconnue';
      if (!this.groupedInscriptions[titre]) {
        this.groupedInscriptions[titre] = [];
      }
      this.groupedInscriptions[titre].push(insc);
    }

    const modalElement = document.getElementById('groupedModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

downloadPdf(titreFormation: string, inscriptions: InscriptionFormation[]): void {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Inscriptions - ${titreFormation}`, 14, 20);

  const tableData = inscriptions.map((insc, index) => [
    index + 1,
    `${insc.prenom} ${insc.nom}`,
    insc.email,
    insc.telephone || '-',
    insc.etat === 'PAIEMENT_CONFIRME' ? '✔️ Confirmé' : '⏳ En attente'
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['#', 'Nom complet', 'Email', 'Téléphone', 'État']],
    body: tableData
  });

  doc.save(`Inscriptions_${titreFormation.replace(/\s+/g, '_')}.pdf`);
}




}
