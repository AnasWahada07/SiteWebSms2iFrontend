import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GalerieService } from '../Services/Galerie.service';
import { Galeries } from '../Class/Galeries';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  galerieForm: FormGroup;
  selectedImage: File | null = null;
  selectedImageUrl: string | null = null;
  updateMode = false;
  selectedGalerieId?: number;
  showForm: boolean = false;

        currentYear: number = new Date().getFullYear();


searchQuery: string = '';
galeriesOriginal: Galeries[] = []; // pour garder toutes les galeries sans filtrage


  constructor(private galerieService: GalerieService, private fb: FormBuilder , private cdRef: ChangeDetectorRef) {
    this.galerieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      client: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadGaleries();
  }

  loadGaleries(): void {
    this.galerieService.getAll().subscribe({
      next: (data) => {
        this.galeries = data;
        this.cdRef.detectChanges();
        this.galeriesOriginal = [...data];


      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des galeries :", err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];

      // Libérer l'ancienne URL si existante
      if (this.selectedImageUrl) {
        URL.revokeObjectURL(this.selectedImageUrl);
      }

      // Générer une URL locale pour prévisualisation
      this.selectedImageUrl = URL.createObjectURL(this.selectedImage);
    }
  }

  onSubmit(): void {
    if (this.galerieForm.invalid) return;

    const formData = new FormData();
    formData.append('title', this.galerieForm.get('title')?.value);
    formData.append('description', this.galerieForm.get('description')?.value);
    formData.append('client', this.galerieForm.get('client')?.value);
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.updateMode && this.selectedGalerieId != null) {
      this.galerieService.updateGalerie(this.selectedGalerieId, formData).subscribe({
        next: () => {
          alert('✅ Galerie mise à jour avec succès');
          this.resetForm();
          this.loadGaleries();
        },
        error: () => alert("❌ Erreur lors de la mise à jour")
      });
    } else {
      this.galerieService.addGalerie(formData).subscribe({
        next: () => {
          alert('✅ Galerie ajoutée avec succès');
          this.resetForm();
          this.loadGaleries();
        },
        error: () => alert("❌ Erreur lors de l'ajout de la galerie")
      });
    }
  }

  onEdit(galerie: Galeries): void {
    this.updateMode = true;
    this.selectedGalerieId = galerie.id;
    this.galerieForm.patchValue({
      title: galerie.title,
      description: galerie.description,
      client: galerie.client
    });
    this.selectedImage = null;

    // Affiche l'image existante (adapter le champ imageUrl selon ta donnée)
    this.selectedImageUrl = galerie.imageUrl || null;

    this.showForm = true;
  }

  onDelete(id: number): void {
    if (confirm('🗑️ Supprimer cette galerie ?')) {
      this.galerieService.deleteGalerie(id).subscribe({
        next: () => {
          this.loadGaleries();
          alert('🧹 Galerie supprimée');
        },
        error: () => alert('❌ Erreur lors de la suppression')
      });
    }
  }

  toggleFormVisibility(): void {
    this.showForm = !this.showForm;
    if (!this.showForm && this.updateMode) {
      this.resetForm();
    }

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

  resetForm(): void {
    this.updateMode = false;
    this.selectedGalerieId = undefined;
    this.galerieForm.reset();
    this.selectedImage = null;

    if (this.selectedImageUrl) {
      URL.revokeObjectURL(this.selectedImageUrl);
    }
    this.selectedImageUrl = null;

    this.showForm = false;
  }
}
