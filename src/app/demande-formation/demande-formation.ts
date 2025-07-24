import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService } from '../Services/Formation.service';
import { Formation } from '../formation/formation';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-demande-formation',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './demande-formation.html',
  styleUrl: './demande-formation.css'
})
export class DemandeFormation implements OnInit {

  formationForm!: FormGroup;

  constructor(private fb: FormBuilder, private formationService: FormationService) {}

  ngOnInit(): void {
    this.formationForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      titre: ['', Validators.required],
      formationType: ['', Validators.required],
      theme: ['', Validators.required],
      description: ['', Validators.required],
      proposerPrix: [''],
      participants: [''],
      technologie: ['', Validators.required],
      duree: ['', Validators.required],
      certificat: ['', Validators.required],
      formateur: ['', Validators.required]
    });
  }

  isInvalid(field: string): boolean {
    const control = this.formationForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.formationForm.valid) {
      const formationData: Formation = this.formationForm.value;

      this.formationService.submitFormation(formationData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Demande envoyée ✅',
            text: 'Votre demande a été envoyée avec succès !',
          });
          this.formationForm.reset();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur ❌',
            text: "Une erreur s'est produite lors de l'envoi de la demande.",
          });
        }
      });

    } else {
      this.formationForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs obligatoires.',
      });
    }
  }
}
