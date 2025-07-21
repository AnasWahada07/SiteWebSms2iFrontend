import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Projet } from '../Class/Projet';
import { ProjetService } from '../Services/Projet.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-projet',
  imports: [

        ReactiveFormsModule,
        HttpClientModule ,
        FormsModule ,
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

  constructor(private projetService: ProjetService , private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadProjets();
  }

loadProjets(): void {
  this.projetService.getAllProjets().subscribe(data => {
    this.projets = data;
    this.cdRef.detectChanges(); 
    this.projetsOriginal = [...this.projets]; 
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
    const formData = new FormData();
    formData.append('title', this.newProjet.title);
    formData.append('description', this.newProjet.description);
    formData.append('duree', this.newProjet.duree);
    formData.append('client', this.newProjet.client);
    formData.append('technologie', this.newProjet.technologie);
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.projetService.createProjetWithImage(formData).subscribe(() => {
      this.newProjet = {};
      this.previewUrl = null;
      this.selectedImageFile = undefined;
      this.loadProjets();
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

    this.projetService.updateProjetWithImage(this.selectedProjet.id, formData).subscribe(() => {
      this.selectedProjet = undefined;
      this.editPreviewUrl = null;
      this.selectedEditImageFile = undefined;
      this.loadProjets();
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
    this.projetService.deleteProjet(id).subscribe(() => this.loadProjets());
  }
}
