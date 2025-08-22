import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Projet } from '../Class/Projet';
import { ProjetService } from '../Services/Projet.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Import du type Modal depuis Bootstrap (bundle doit être chargé via angular.json)
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-view-projet',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, FormsModule, CommonModule],
  templateUrl: './view-projet.html',
  styleUrls: ['./view-projet.css']
})
export class ViewProjet implements OnInit {
  projets: Projet[] = [];
  projetsOriginal: Projet[] = [];

  // Ajout
  newProjet: Partial<Projet> = {};
  selectedImageFile?: File;
  previewUrl: string | null = null;

  // Edition (modal)
  selectedProjet: Partial<Projet> | null = null;
  selectedEditImageFile?: File;
  editPreviewUrl: string | null = null;

  // Recherche
  searchQuery: string = '';

  currentYear: number = new Date().getFullYear();

  // Référence au modal Bootstrap
  @ViewChild('editProjetModal') editProjetModalRef!: ElementRef<HTMLDivElement>;
  private editModalInstance?: bootstrap.Modal;

  constructor(
    private projetService: ProjetService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjets();
  }

  /** =============== NAV =============== */
  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  /** =============== CHARGEMENT =============== */
  loadProjets(): void {
    this.projetService.getAllProjets().subscribe({
      next: (data) => {
        this.projets = data ?? [];
        this.projetsOriginal = [...this.projets];
        this.cdRef.detectChanges();
      },
      error: () => Swal.fire('Erreur', 'Erreur de chargement des projets', 'error')
    });
  }

  /** =============== AJOUT =============== */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImageFile = input.files[0];

      if (this.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(this.previewUrl);
      }
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
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
      next: () => {
        this.newProjet = {};
        if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
        this.selectedImageFile = undefined;
        this.loadProjets();
        Swal.fire('Succès', 'Projet ajouté avec succès', 'success');
      },
      error: (err) => {
        const msg = err?.headers?.get?.('X-Error') || err?.error?.message || 'Échec de l\'ajout du projet';
        console.error('Upload error:', err);
        Swal.fire('Erreur', msg, 'error');
      }
    });
  }

  /** =============== MODAL ÉDITION =============== */
  // Ouvre le modal et pré-remplit les valeurs
  editProjet(projet: Projet): void {
    this.selectedProjet = { ...projet };
    this.selectedEditImageFile = undefined;
    this.editPreviewUrl = projet.imageUrl ?? null;

    // Instancie + ouvre le modal Bootstrap
    if (!this.editModalInstance) {
      this.editModalInstance = new bootstrap.Modal(this.editProjetModalRef.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
    }
    this.editModalInstance.show();
  }

  // Ferme le modal et nettoie l'état
  closeEditModal(): void {
    this.editModalInstance?.hide();
    this.selectedEditImageFile = undefined;
    this.editPreviewUrl = null;
    this.selectedProjet = null;
  }

  // Gestion du fichier (édition)
  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedEditImageFile = input.files[0];

      if (this.editPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(this.editPreviewUrl);
      }
      const reader = new FileReader();
      reader.onload = () => (this.editPreviewUrl = reader.result as string);
      reader.readAsDataURL(this.selectedEditImageFile);
    }
  }

  // Soumission édition
  updateProjet(): void {
    if (!this.selectedProjet?.id) return;

    // Validations rapides
    const title = (this.selectedProjet.title ?? '').trim();
    const description = (this.selectedProjet.description ?? '').trim();
    const client = (this.selectedProjet.client ?? '').trim();
    if (!title || !description || !client) {
      Swal.fire('Champs requis', 'Titre, description et client sont obligatoires.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('duree', this.selectedProjet.duree ?? '');
    formData.append('client', client);
    formData.append('technologie', this.selectedProjet.technologie ?? '');
    if (this.selectedEditImageFile) formData.append('image', this.selectedEditImageFile);

    this.projetService.updateProjetWithImage(this.selectedProjet.id!, formData).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadProjets();
        Swal.fire('Succès', 'Projet mis à jour avec succès', 'success');
      },
      error: () => Swal.fire('Erreur', 'Échec de la mise à jour du projet', 'error')
    });
  }

  /** =============== SUPPRESSION =============== */
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
          error: () => Swal.fire('Erreur', 'Erreur lors de la suppression', 'error')
        });
      }
    });
  }

  /** =============== RECHERCHE =============== */
  applyProjetFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.projets = this.projetsOriginal.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.client && p.client.toLowerCase().includes(q))
    );
  }

  resetProjetFilter(): void {
    this.searchQuery = '';
    this.projets = [...this.projetsOriginal];
  }
}
