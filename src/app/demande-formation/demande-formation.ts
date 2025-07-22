import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService } from '../Services/Formation.service';
import { Formation } from '../formation/formation';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-demande-formation',
  imports: [

            ReactiveFormsModule,
        HttpClientModule ,
        CommonModule


  ],
  templateUrl: './demande-formation.html',
  styleUrl: './demande-formation.css'
})
export class DemandeFormation implements OnInit {

  formationForm!: FormGroup;
  successMessage = '';
  errorMessage = '';


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
  formateur : ['', Validators.required]

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
          this.successMessage = 'Votre demande a été envoyée avec succès.';
          this.errorMessage = '';
          this.formationForm.reset();
        },
        error: () => {
          this.errorMessage = "Une erreur s'est produite lors de l'envoi de la demande.";
          this.successMessage = '';
        }
      });
    } else {
      this.formationForm.markAllAsTouched();
    }
  }
}
