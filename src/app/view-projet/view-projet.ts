import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Projet } from '../Class/Projet';
import { ProjetService } from '../Services/Projet.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-projet',
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './view-projet.html',
  styleUrl: './view-projet.css'
})
export class ViewProjet implements OnInit {
  projets: Projet[] = [];
  newProjet: any = {};
  selectedImageFile?: File;
  previewUrl: string | ArrayBuffer | null = null;

  searchQuery: string = '';
  projetsOriginal: any[] = [];

  currentYear: number = new Date().getFullYear();

  selectedProjet?: any;
  selectedEditImageFile?: File;
  editPreviewUrl: string | ArrayBuffer | null = null;

  constructor(
    private projetService: ProjetService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjets();
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  loadProjets(): void {
    this.projetService.getAllProjets().subscribe({
      next: (data) => {
        this.projets = data;
        this.cdRef.detectChanges();
        this.projetsOriginal = [...this.projets];
      },
      error: () => {
        Swal.fire('Erreur', 'Erreur de chargement des projets', 'error');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

saveProjet(): void {
  const fd = new FormData();
  fd.append('title', this.newProjet.title ?? '');
  fd.append('description', this.newProjet.description ?? '');
  fd.append('duree', this.newProjet.duree ?? '');
  fd.append('client', this.newProjet.client ?? '');
  fd.append('technologie', this.newProjet.technologie ?? '');
  if (this.selectedImageFile) fd.append('image', this.selectedImageFile);

  this.projetService.createProjetWithImage(fd).subscribe({
    next: (res) => {
      this.newProjet = {};
      this.previewUrl = null;
      this.selectedImageFile = undefined;
      this.loadProjets();
      Swal.fire('Succès', 'Projet ajouté avec succès', 'success');
    },
    error: (err) => {
      const msg =
        (err?.headers?.get?.('X-Error')) ||
        (err?.error?.message) ||
        'Échec de l\'ajout du projet';
      console.error('Upload error:', err);
      Swal.fire('Erreur', msg, 'error');
    }
  });
}
  editProjet(projet: Projet): void {
    this.selectedProjet = { ...projet };
    this.editPreviewUrl = projet.imageUrl;
    this.selectedEditImageFile = undefined;
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedEditImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.editPreviewUrl = reader.result;
      reader.readAsDataURL(this.selectedEditImageFile);
    }
  }

  updateProjet(): void {
    if (!this.selectedProjet?.id) return;

    const formData = new FormData();
    formData.append('title', this.selectedProjet.title);
    formData.append('description', this.selectedProjet.description);
    formData.append('duree', this.selectedProjet.duree);
    formData.append('client', this.selectedProjet.client);
    formData.append('technologie', this.selectedProjet.technologie);
    if (this.selectedEditImageFile) {
      formData.append('image', this.selectedEditImageFile);
    }

    this.projetService.updateProjetWithImage(this.selectedProjet.id, formData).subscribe({
      next: () => {
        this.selectedProjet = undefined;
        this.editPreviewUrl = null;
        this.selectedEditImageFile = undefined;
        this.loadProjets();
        Swal.fire('Succès', 'Projet mis à jour avec succès', 'success');
      },
      error: () => {
        Swal.fire('Erreur', 'Échec de la mise à jour du projet', 'error');
      }
    });
  }

  applyProjetFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.projets = this.projetsOriginal.filter(projet =>
      (projet.title && projet.title.toLowerCase().includes(query)) ||
      (projet.client && projet.client.toLowerCase().includes(query))
    );
  }

  resetProjetFilter(): void {
    this.searchQuery = '';
    this.projets = [...this.projetsOriginal];
  }

  deleteProjet(id: number): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir supprimer ce projet ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.projetService.deleteProjet(id).subscribe({
          next: () => {
            this.loadProjets();
            Swal.fire('Supprimé', 'Projet supprimé avec succès', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Erreur lors de la suppression', 'error');
          }
        });
      }
    });
  }
}
