import { ChangeDetectorRef, Component } from '@angular/core';
import { InscriptionFormation } from '../Class/InscriptionFormation';
import { FormationService } from '../Services/Formation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-view-inscrit-formation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-inscrit-formation.html',
  styleUrl: './view-inscrit-formation.css'
})
export class ViewInscritFormation {
  inscriptions: InscriptionFormation[] = [];
  inscriptionsOriginal: InscriptionFormation[] = [];
  filteredInscriptions: InscriptionFormation[] = [];
  groupedInscriptions: { [titre: string]: InscriptionFormation[] } = {};

  searchText: string = '';
  selectedEtat: string = '';
  currentYear: number = new Date().getFullYear();
  objectKeys = Object.keys; 

  selectedInscription: InscriptionFormation = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    etat: '',
    formation: undefined
  };

  constructor(
    private inscriptionService: FormationService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.inscriptionService.getAll().subscribe({
      next: (data) => {
        this.inscriptionsOriginal = data;
        this.filteredInscriptions = [...this.inscriptionsOriginal];
        this.cdRef.detectChanges();
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les inscriptions.', 'error');
      }
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

    Swal.fire({
      title: 'Supprimer l\'inscription ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.inscriptionService.delete(id).subscribe({
          next: () => {
            this.inscriptionsOriginal = this.inscriptionsOriginal.filter(insc => insc.id !== id);
            this.applyFilters();
            Swal.fire('Supprimée', 'Inscription supprimée avec succès.', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'La suppression a échoué.', 'error');
          }
        });
      }
    });
  }

  openEditModal(inscription: InscriptionFormation): void {
    this.selectedInscription = { ...inscription }; // clone
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

submitUpdate(): void {
  if (!this.selectedInscription.id) return;

  const updatedPayload = {
    nom: this.selectedInscription.nom,
    prenom: this.selectedInscription.prenom,
    email: this.selectedInscription.email,
    telephone: this.selectedInscription.telephone,
    etat: this.selectedInscription.etat,
    formationId: this.selectedInscription.formation?.id
  };

  this.inscriptionService.update(this.selectedInscription.id, updatedPayload).subscribe({
    next: () => {
      const index = this.inscriptionsOriginal.findIndex(i => i.id === this.selectedInscription.id);
      if (index !== -1) {
        this.inscriptionsOriginal[index] = {
          ...this.inscriptionsOriginal[index],
          ...updatedPayload,
          formation: this.selectedInscription.formation
        };
        this.applyFilters();
        this.cdRef.detectChanges(); // 🔄 mise à jour immédiate
      }

      const modal = bootstrap.Modal.getInstance(document.getElementById('editModal')!);
      modal?.hide();

      Swal.fire('Succès', 'Inscription mise à jour avec succès.', 'success');
    },
    error: () => {
      Swal.fire('Erreur', 'La mise à jour a échoué.', 'error');
    }
  });
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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const currentDate = new Date().toLocaleDateString();

  // 🔹 Titre principal
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(`Liste des participants`, pageWidth / 2, 20, { align: 'center' });

  // 🔹 Sous-titre
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Formation : ${titreFormation}`, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Date : ${currentDate}`, pageWidth - 20, 35, { align: 'right' });

  // 🔹 Données du tableau
  const tableData = inscriptions.map((insc, index) => [
    index + 1,
    `${insc.prenom} ${insc.nom}`,
    insc.email,
    insc.telephone || '-',
    insc.etat === 'PAIEMENT_CONFIRME' ? '✔️ Confirmé' : '⏳ En attente',
    '',
    '',
  ]);

  autoTable(doc, {
    startY: 40,
    head: [[
      '#',
      'Nom complet',
      'Email',
      'Téléphone',
      'État',
      'Signature Entrée',
      'Signature Sortie'
    ]],
    body: tableData,
    styles: {
      fontSize: 10,
      halign: 'center',
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: 'center',
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'left', cellWidth: 40 },
      2: { halign: 'left', cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    }

  });

  // 🔽 Sauvegarde du fichier
  doc.save(`Liste_${titreFormation.replace(/\s+/g, '_')}.pdf`);
  Swal.fire('✅ PDF généré', 'Le fichier a été téléchargé avec succès.', 'success');

  // 🔽 Sauvegarde du fichier
  doc.save(`Liste_${titreFormation.replace(/\s+/g, '_')}.pdf`);
  Swal.fire('✅ PDF généré', 'Le fichier a été téléchargé avec succès.', 'success');
}
  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }
}
