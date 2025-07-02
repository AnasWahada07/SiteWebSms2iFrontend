import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GalerieService } from '../Services/Galerie.service';
import { Galeries } from '../Class/Galeries';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-view-galerie',
  imports: [

ReactiveFormsModule , 
    FormsModule,
    CommonModule,
    HttpClientModule




  ],
  templateUrl: './view-galerie.html',
  styleUrl: './view-galerie.css'
})
export class ViewGalerie implements OnInit {
    showForm: boolean = false; 
      selectedFile: File | null = null;


  galeries: Galeries[] = [];
  galerieForm: FormGroup;
  selectedImage: File | null = null;
  updateMode = false;
  selectedGalerieId?: number;

  constructor(private galerieService: GalerieService, private fb: FormBuilder) {
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
    this.galerieService.getAll().subscribe(data => {
      this.galeries = data;
    });
  }

  onFileSelected(event: any): void {
    this.selectedImage = event.target.files[0];
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('title', this.galerieForm.get('title')?.value);
    formData.append('description', this.galerieForm.get('description')?.value);
    formData.append('client', this.galerieForm.get('client')?.value);
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.updateMode && this.selectedGalerieId) {
      this.galerieService.updateGalerie(this.selectedGalerieId, formData).subscribe(() => {
        alert('Galerie mise à jour');
        this.resetForm();
        this.loadGaleries();
      });
    } else {
      this.galerieService.addGalerie(formData).subscribe(() => {
        alert('Galerie ajoutée');
        this.resetForm();
        this.loadGaleries();
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
    this.selectedImage = null; // reset image
  }

  onDelete(id: number): void {
    if (confirm('Supprimer cette galerie ?')) {
      this.galerieService.deleteGalerie(id).subscribe(() => {
        this.loadGaleries();
        alert('Galerie supprimée');
      });
    }
  }

    toggleFormVisibility() {
    this.showForm = !this.showForm;
    if (!this.showForm && this.updateMode) {
      this.resetForm();
    }
  }



  resetForm(): void {
    this.updateMode = false;
    this.selectedGalerieId = undefined;
    this.galerieForm.reset();
    this.selectedImage = null;
  }
}
