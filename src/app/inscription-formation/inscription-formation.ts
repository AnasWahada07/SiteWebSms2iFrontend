import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InscriptionService } from '../Services/Inscription.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-inscription-formation',
  imports: [

ReactiveFormsModule, 
FormsModule,
 CommonModule,
 HttpClientModule

  ],
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

  submits() {
  if (this.form.invalid) {
    this.form.markAllAsTouched(); // pour afficher les erreurs
    return;
  }
  }


  submit() {
    if (this.form.invalid) return;

    const values = this.form.value;
    const payload = {
      prenom: values.prenom,
      nom: values.nom,
      email: values.email,
      telephone: values.telephone,
      formation: { id: values.formationId }
    };

    this.inscriptionService.register(payload).subscribe({
      next: () => alert('Inscription réussie'),
      error: () => alert('Erreur lors de l\'inscription')
    });
  }

}





