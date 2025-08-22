import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GalerieService } from '../Services/Galerie.service';
import { Galeries } from '../Class/Galeries';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-galerie',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './view-galerie.html',
  styleUrls: ['./view-galerie.css']
})
export class ViewGalerie implements OnInit {
  galeries: Galeries[] = [];
  galeriesOriginal: Galeries[] = [];

  // Formulaire d'ajout
  galerieForm: FormGroup;
  selectedImage: File | null = null;
  selectedImageUrl: string | null = null;

  currentYear: number = new Date().getFullYear();
  searchQuery: string = '';

  constructor(
    private galerieService: GalerieService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {
    this.galerieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      client: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadGaleries();
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  loadGaleries(): void {
    this.galerieService.getAll().subscribe({
      next: (data) => {
        this.galeries = data;
        this.galeriesOriginal = [...data];
        this.cdRef.detectChanges();
      },
      error: () => {
        Swal.fire('Erreur', 'Erreur de chargement des galeries', 'error');
      }
    });
  }

  /** Ajout - sélection d'image avec aperçu */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];

      if (this.selectedImageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(this.selectedImageUrl);
      }
      this.selectedImageUrl = URL.createObjectURL(this.selectedImage);
    }
  }

  /** Ajout - soumission */
  onSubmit(): void {
    if (this.galerieForm.invalid) return;

    const formData = new FormData();
    formData.append('title', this.galerieForm.get('title')?.value);
    formData.append('description', this.galerieForm.get('description')?.value);
    formData.append('client', this.galerieForm.get('client')?.value);
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.galerieService.addGalerie(formData).subscribe({
      next: () => {
        Swal.fire('Succès', 'Galerie ajoutée avec succès', 'success');
        this.resetAddForm();
        this.loadGaleries();
      },
      error: () => Swal.fire('Erreur', 'Échec de l\'ajout de la galerie', 'error')
    });
  }

  /** ✅ Édition - pop-up SweetAlert2 avec formulaire pré-rempli */
  onEdit(galerie: Galeries): void {
    const existingImage = galerie.imageUrl || '';

    Swal.fire({
      title: 'Modifier la galerie',
      width: 700,
      showCancelButton: true,
      confirmButtonText: 'Mettre à jour',
      cancelButtonText: 'Annuler',
      focusConfirm: false,
      html: `
        <div class="text-start">
          <div class="mb-2">
            <label class="form-label fw-semibold">Titre</label>
            <input id="swal-title" class="form-control" type="text" value="${this.escapeHtml(galerie.title || '')}">
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Description</label>
            <textarea id="swal-description" class="form-control" rows="3">${this.escapeHtml(galerie.description || '')}</textarea>
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Client</label>
            <input id="swal-client" class="form-control" type="text" value="${this.escapeHtml(galerie.client || '')}">
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Image (optionnelle)</label>
            <input id="swal-image" class="form-control" type="file" accept="image/*">
            <div class="mt-2">
              <img id="swal-preview" src="${existingImage}" alt="Aperçu" style="max-height:160px;border-radius:8px;display:${existingImage ? 'block' : 'none'};"/>
            </div>
          </div>
        </div>
      `,
      didOpen: () => {
        const fileInput = document.getElementById('swal-image') as HTMLInputElement;
        const preview = document.getElementById('swal-preview') as HTMLImageElement;

        fileInput.addEventListener('change', () => {
          const file = fileInput.files?.[0];
          if (!file) {
            if (existingImage) {
              preview.src = existingImage;
              preview.style.display = 'block';
            } else {
              preview.style.display = 'none';
            }
            return;
          }
          const reader = new FileReader();
          reader.onload = (e: any) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        });
      },
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value.trim();
        const description = (document.getElementById('swal-description') as HTMLTextAreaElement).value.trim();
        const client = (document.getElementById('swal-client') as HTMLInputElement).value.trim();
        const file = (document.getElementById('swal-image') as HTMLInputElement).files?.[0] || null;

        if (!title || !description || !client) {
          Swal.showValidationMessage('Titre, description et client sont obligatoires.');
          return;
        }

        return { title, description, client, file };
      }
    }).then(result => {
      if (!result.isConfirmed || !galerie.id) return;

      const { title, description, client, file } =
        result.value as { title: string; description: string; client: string; file: File | null };

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('client', client);
      if (file) formData.append('image', file);

      this.galerieService.updateGalerie(galerie.id, formData).subscribe({
        next: () => {
          Swal.fire('Succès', 'Galerie mise à jour avec succès', 'success');
          this.loadGaleries();
        },
        error: () => Swal.fire('Erreur', 'Échec de la mise à jour', 'error')
      });
    });
  }

  onDelete(id: number): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous vraiment supprimer cette galerie ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.galerieService.deleteGalerie(id).subscribe({
          next: () => {
            this.loadGaleries();
            Swal.fire('Supprimée', 'Galerie supprimée avec succès', 'success');
          },
          error: () => Swal.fire('Erreur', 'Échec de la suppression', 'error')
        });
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.galeries = this.galeriesOriginal.filter(galerie =>
      (galerie.title && galerie.title.toLowerCase().includes(query)) ||
      (galerie.client && galerie.client.toLowerCase().includes(query))
    );
  }

  resetFilter(): void {
    this.searchQuery = '';
    this.galeries = [...this.galeriesOriginal];
  }

  resetAddForm(): void {
    this.galerieForm.reset();
    this.selectedImage = null;
    if (this.selectedImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedImageUrl);
    }
    this.selectedImageUrl = null;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
