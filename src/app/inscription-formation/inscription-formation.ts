import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InscriptionService } from '../Services/Inscription.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inscription-formation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './inscription-formation.html',
  styleUrl: './inscription-formation.css'
})
export class InscriptionFormation implements OnInit {

  form: FormGroup;
  types: string[] = [];
  formations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private inscriptionService: InscriptionService
  ) {
    this.form = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      typeFormation: ['', Validators.required],
      formationId: ['', Validators.required],
      objectif: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.inscriptionService.getTypes().subscribe(data => this.types = data);
  }

  onTypeChange() {
    const type = this.form.value.typeFormation;
    if (type) {
      this.inscriptionService.getFormationsByType(type)
        .subscribe(res => this.formations = res);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs requis.',
      });
      return;
    }

    const values = this.form.value;
    const payload = {
      prenom: values.prenom,
      nom: values.nom,
      email: values.email,
      telephone: values.telephone,
      formation: { id: values.formationId },
      objectif: values.objectif
    };

    this.inscriptionService.register(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie 🎉',
          text: 'Votre demande a bien été envoyée.',
        });
        this.resetForm();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur ❌',
          text: "Une erreur s'est produite lors de l'inscription.",
        });
      }
    });
  }

  resetForm() {
    this.form.reset();
    this.formations = [];
  }
}
