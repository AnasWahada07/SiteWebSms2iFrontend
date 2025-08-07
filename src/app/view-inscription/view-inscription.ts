import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InscriptionPFE, ViewInscriptionService } from '../Services/ViewInscription.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-inscription',
  standalone: true,
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
    
    
  ],
  templateUrl: './view-inscription.html',
  styleUrl: './view-inscription.css'
})
export class ViewInscription implements OnInit {

  searchQuery: string = '';
  inscriptionsOriginal: InscriptionPFE[] = [];
  inscriptions: InscriptionPFE[] = [];
  selectedInscription?: InscriptionPFE;

  currentYear: number = new Date().getFullYear();

  constructor(
    private inscriptionService: ViewInscriptionService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInscriptions();
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  loadInscriptions(): void {
    this.inscriptionService.getAll().subscribe({
      next: (data) => {
        this.inscriptionsOriginal = data;
        this.inscriptions = [...data];
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Échec du chargement des inscriptions.', 'error');
      }
    });
  }

deleteInscription(id: number): void {
  Swal.fire({
    title: 'Supprimer cette inscription ?',
    text: 'Cette action est irréversible.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.inscriptionService.delete(id, { responseType: 'text' as 'json' }).subscribe({
        next: (msg) => {
          this.loadInscriptions();
          Swal.fire('✅ Supprimée', msg || 'Inscription supprimée avec succès.', 'success');
        },
        error: (err) => {
          console.error(err);
          Swal.fire('❌ Erreur', 'Impossible de supprimer cette inscription.', 'error');
        }
      });
    }
  });
}

  editInscription(inscription: InscriptionPFE): void {
    this.selectedInscription = { ...inscription }; 
  }

  saveModification(): void {
    if (!this.selectedInscription) return;

    this.inscriptionService.update(this.selectedInscription.id, this.selectedInscription).subscribe({
      next: () => {
        this.selectedInscription = undefined;
        this.loadInscriptions();
        Swal.fire('Mis à jour', 'L\'inscription a été mise à jour avec succès.', 'success');
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Échec de la mise à jour.', 'error');
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.inscriptions = this.inscriptionsOriginal.filter(i =>
      (i.nom && i.nom.toLowerCase().includes(query)) ||
      (i.prenom && i.prenom.toLowerCase().includes(query)) ||
      (i.classe && i.classe.toLowerCase().includes(query)) ||
      (i.sujetTitre && i.sujetTitre.toLowerCase().includes(query))
    );
  }

  resetFilter(): void {
    this.searchQuery = '';
    this.inscriptions = [...this.inscriptionsOriginal];
  }

  cancelEdit(): void {
    this.selectedInscription = undefined;
  }
}
