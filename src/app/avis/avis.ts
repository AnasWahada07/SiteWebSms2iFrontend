import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Avis } from '../Class/Avis';
import { AvisService } from '../Services/avis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-avis',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './avis.html',
  styleUrl: './avis.css'
})
export class AvisComponent implements OnInit {

  private fb = inject(FormBuilder);
  private avisService = inject(AvisService);
    currentYear: number = new Date().getFullYear();


  avisList = signal<Avis[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form = this.fb.group({
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['',[Validators.email, Validators.maxLength(150)]],
    poste: ['', [Validators.required, Validators.maxLength(150)]],
    societe: ['', [Validators.required, Validators.maxLength(150)]],
    avis: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.avisService.list().subscribe({
      next: (data) => {
        this.avisList.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.showErrorAlert('Erreur lors du chargement des avis', err);
      }
    });
  }

  onFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.imagePreview = null;
      return;
    }
    const file = input.files[0];
    
    // Vérification de la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.showWarningAlert('Le fichier est trop volumineux', 'Veuillez sélectionner une image de moins de 2MB');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showWarningAlert('Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const value = this.form.value;
    const payload = {
      prenom: value.prenom || '',
      nom: value.nom || '',
      email: value.email || null,
      poste: value.poste || '',
      societe: value.societe || '',
      avis: value.avis || ''
    };

    this.loading.set(true);
    this.avisService.createMultipart(payload, this.selectedFile || undefined).subscribe({
      next: (created) => {
        this.form.reset();
        this.selectedFile = null;
        this.imagePreview = null;
        this.avisList.set([created, ...this.avisList()]);
        this.loading.set(false);
        this.showSuccessAlert('Avis ajouté', 'L\'avis a été enregistré avec succès');
      },
      error: (err) => {
        this.loading.set(false);
        this.showErrorAlert('Erreur lors de la création', err);
      }
    });
  }

  async remove(item: Avis): Promise<void> {
    if (!item.id) return;

    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      text: 'Êtes-vous sûr de vouloir supprimer cet avis ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      this.avisService.delete(item.id).subscribe({
        next: () => {
          this.avisList.set(this.avisList().filter(a => a.id !== item.id));
          this.showSuccessAlert('Supprimé', 'L\'avis a été supprimé avec succès');
        },
        error: (err) => {
          this.showErrorAlert('Suppression impossible', err);
        }
      });
    }
  }

  replaceImage(item: Avis, ev: Event): void {
    if (!item.id) return;
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.showWarningAlert('Le fichier est trop volumineux', 'Veuillez sélectionner une image de moins de 2MB');
      return;
    }

    this.loading.set(true);
    this.avisService.uploadImage(item.id, file).subscribe({
      next: (updated) => {
        this.avisList.set(this.avisList().map(a => a.id === item.id ? updated : a));
        this.loading.set(false);
        this.showSuccessAlert('Image mise à jour', 'L\'image a été changée avec succès');
      },
      error: (err) => {
        this.loading.set(false);
        this.showErrorAlert('Erreur lors du téléversement', err);
      }
    });
  }

  imageUrlOrNull(item: Avis): string | null {
    return this.avisService.imageUrl(item.imageName || null);
  }

  initials(item: Avis): string {
    const f = item.prenom ? item.prenom[0] : '';
    const l = item.nom ? item.nom[0] : '';
    return (f + l).toUpperCase();
  }

  // Méthodes helpers pour SweetAlert2
  private showSuccessAlert(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      timer: 3000
    });
  }

  private showWarningAlert(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonColor: '#3085d6'
    });
  }

  private showErrorAlert(title: string, error: any): void {
    console.error(error);
    Swal.fire({
      title,
      text: 'Une erreur est survenue. Veuillez réessayer.',
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  }
}