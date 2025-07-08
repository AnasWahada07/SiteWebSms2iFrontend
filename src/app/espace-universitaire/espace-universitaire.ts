import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompetenceService } from '../Services/Competence.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SujetPFE } from '../Class/SujetPFE';
import { SujetPfeService } from '../Services/SujetPfe.service';
import { InscriptionPFE } from '../Class/InscriptionPFE';
import { InscriptionPFEService } from '../Services/InscriptionPFE.service';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-espace-universitaire',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './espace-universitaire.html',
  styleUrls: ['./espace-universitaire.css']
})
export class EspaceUniversitaire implements OnInit {

  form = {
    nom: '',
    prenom: '',
    email: '',
    description: '',
    telephone: ''
  };
  selectedFileMaquette: File | null = null;
  loading = false;

  // 🟣 Nouveau formulaire pour Demande de Maquette (textuel)
  demandeMaquetteForm!: FormGroup;

  // 🔶 Autres données
  selectedSujetId: number = 0;
  formData: InscriptionPFE = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    classe: '',
    specialite: ''
  };

  sujetsInfo: SujetPFE[] = [];
  informatiqueIndustrielle: SujetPFE[] = [];

  sujet = {
    nom: '',
    prenom: '',
    email: '',
    description: '',
    type: '',
    titre: ''
  };

  competenceForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private competenceService: CompetenceService,
    private http: HttpClient,
    private SujetPfeService: SujetPfeService,
    private inscriptionService: InscriptionPFEService
  ) {
    setTimeout(() => this.loadSujets(), 0);

    this.competenceForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      specialite: ['', Validators.required],
      competence: ['', [Validators.required, Validators.minLength(10)]],
      experience: ['', [Validators.required, Validators.minLength(10)]],
      cv: [null, Validators.required] 
    });
  
    this.demandeMaquetteForm = this.fb.group({
      nomComplet: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      institution: [''],
      descriptionBesoin: ['', Validators.required],
      dateSouhaitee: ['']
    });
  }

  ngOnInit(): void {
    this.loadSujets();
  }

  onSubmitDemandeMaquette(): void {
    if (this.demandeMaquetteForm.invalid) return;

    const data = this.demandeMaquetteForm.value;

    this.http.post('http://localhost:8080/api/demandes', data).subscribe({
      next: () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('demanderMaquetteModal')!);
        modal?.hide();
        this.demandeMaquetteForm.reset();

        const toastEl = document.getElementById('toastSuccess');
        if (toastEl) new bootstrap.Toast(toastEl).show();
      },
      error: (err) => {
        console.error(err);
        const toastErr = document.getElementById('toastError');
        if (toastErr) new bootstrap.Toast(toastErr).show();
      }
    });
  }

  // ✅ Envoi proposition maquette avec fichier
onFileSelectedMaquette(event: any): void {
  const file = event.target.files[0];
  this.selectedFileMaquette = file ? file : null;
}

  onSubmitsMaquette(): void {
    if (!this.selectedFileMaquette) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    this.loading = true;

    const formData = new FormData();
    formData.append('nom', this.form.nom);
    formData.append('prenom', this.form.prenom);
    formData.append('telephone', this.form.telephone);
    formData.append('email', this.form.email);
    formData.append('description', this.form.description);
    formData.append('fichier', this.selectedFileMaquette);

    this.http.post('http://localhost:8080/api/maquettes', formData).subscribe({
      next: () => {
        this.loading = false;
        this.resetMaquetteForm();
        const modal = bootstrap.Modal.getInstance(document.getElementById('proposerMaquetteModal')!);
        modal?.hide();
        const toastEl = document.getElementById('toastSuccess');
        if (toastEl) new bootstrap.Toast(toastEl).show();
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        const toastErr = document.getElementById('toastError');
        if (toastErr) new bootstrap.Toast(toastErr).show();
      }
    });
  }

  resetMaquetteForm(): void {
    this.form = {
      nom: '',
      prenom: '',
      email: '',
      description: '',
      telephone: ''
    };
    this.selectedFileMaquette = null;
    const fileInput = document.getElementById('maqFichier') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.competenceForm.patchValue({ cv: file });
    }
  }
  
  onSubmit() {
    if (!this.selectedFile) {
      alert('Veuillez joindre un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('cv', this.selectedFile);

    const competencePayload = this.competenceForm.value;
    formData.append('competence', new Blob([JSON.stringify(competencePayload)], { type: 'application/json' }));

    this.competenceService.addCompetence(formData).subscribe({
      next: () => {
        alert('Compétence envoyée avec succès');
        this.competenceForm.reset();
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'envoi");
      }
    });
  }

  openModal(event: any): void {
    const btn = event.relatedTarget;
    this.selectedSujetId = +btn.getAttribute('data-projet-id');
    (document.getElementById('projetSelectionne') as HTMLInputElement).value = btn.getAttribute('data-projet');
    (document.getElementById('projetId') as HTMLInputElement).value = btn.getAttribute('data-projet-id');
  }

  submitInscription(): void {
    if (!this.selectedSujetId) return;

    this.inscriptionService.createInscription(this.selectedSujetId, this.formData).subscribe({
      next: () => {
        alert('Inscription réussie ✅');
        const modal = document.getElementById('inscriptionModal')!;
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance?.hide();
        this.formData = { nom: '', prenom: '', telephone: '', email: '', classe: '', specialite: '' };
      },
      error: err => {
        alert('Erreur lors de l\'inscription ❌');
        console.error(err);
      }
    });
  }

  onFileChangepfe(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  onSubmitpfe(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('sujet', new Blob([JSON.stringify(this.sujet)], { type: 'application/json' }));
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8080/api/sujets', formData).subscribe({
      next: () => {
        alert('Sujet proposé avec succès !');
        this.resetForm();
      },
      error: (err) => {
        alert('Erreur lors de l’envoi');
        console.error(err);
      },
    });
  }

  loadSujets(): void {
    this.SujetPfeService.getSujetsConfirmesGroupes().subscribe(data => {
      this.sujetsInfo = data.informatique;
      this.informatiqueIndustrielle = data.informatiqueIndustrielle;
    });
  }

  resetForm(): void {
    this.sujet = {
      nom: '',
      prenom: '',
      email: '',
      description: '',
      type: '',
      titre: ''
    };
    this.selectedFile = null;
    (document.getElementById('pfeFile') as HTMLInputElement).value = '';
  }
}
