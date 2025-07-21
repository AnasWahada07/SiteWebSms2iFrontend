import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './espace-universitaire.html',
  styleUrls: ['./espace-universitaire.css']
})
export class EspaceUniversitaire implements OnInit {

  currentYear: number = new Date().getFullYear();
  successMessage: string = '';
  errorMessage: string = '';
  selectedCompetence: string = '';

  form = {
    nom: '',
    prenom: '',
    email: '',
    description: '',
    telephone: ''
  };
  selectedFileMaquette: File | null = null;
  selectedFile: File | null = null;

  demandeMaquetteForm!: FormGroup;
  competenceForm: FormGroup;

  selectedSujetId: number = 0;
  selectedSujet: SujetPFE | null = null;

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
    titre: '',
    profil: '',
    technologie: ''
  };

  constructor(
    private fb: FormBuilder,
    private competenceService: CompetenceService,
    private http: HttpClient,
    private sujetPfeService: SujetPfeService,
    private inscriptionService: InscriptionPFEService,
    private cdRef: ChangeDetectorRef
  ) {
    this.competenceForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      specialite: ['', Validators.required],
      competence: ['', [Validators.required, Validators.minLength(10)]],
      experience: ['', [Validators.required, Validators.minLength(10)]],
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

  loadSujets(): void {
    this.sujetPfeService.getSujetsConfirmesGroupes().subscribe(data => {
      this.sujetsInfo = data.informatique;
      this.informatiqueIndustrielle = data.informatiqueIndustrielle;
      this.cdRef.detectChanges();
    });
  }

  openDetails(sujet: SujetPFE): void {
    this.selectedSujet = sujet;
  }

  onSubmitDemandeMaquette(): void {
    if (this.demandeMaquetteForm.invalid) return;
    const data = this.demandeMaquetteForm.value;
    this.http.post('http://192.168.1.54:8082/api/demandes', data).subscribe({
      next: () => {
        bootstrap.Modal.getInstance(document.getElementById('demanderMaquetteModal')!)?.hide();
        this.cleanModalState();
        this.demandeMaquetteForm.reset();
        this.showToast('toastSuccess');
      },
      error: err => {
        console.error(err);
        this.showToast('toastError');
      }
    });
  }

  onFileSelectedMaquette(event: any): void {
    this.selectedFileMaquette = event.target.files[0] || null;
  }

  onSubmitsMaquette(): void {
    if (!this.selectedFileMaquette) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }
    const formData = new FormData();
    formData.append('maquette', new Blob([JSON.stringify(this.form)], { type: 'application/json' }));
    formData.append('file', this.selectedFileMaquette);
    this.http.post('http://192.168.1.54:8082/api/maquettes', formData).subscribe({
      next: () => {
        this.resetMaquetteForm();
        bootstrap.Modal.getInstance(document.getElementById('proposerMaquetteModal')!)?.hide();
        this.cleanModalState();
        this.showToast('toastSuccess');
      },
      error: err => {
        console.error(err);
        this.showToast('toastError');
      }
    });
  }

  resetMaquetteForm(): void {
    this.form = { nom: '', prenom: '', email: '', description: '', telephone: '' };
    this.selectedFileMaquette = null;
    const fileInput = document.getElementById('maqFichier') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  onSubmit(): void {
    if (this.competenceForm.invalid || !this.selectedFile) {
      this.errorMessage = "Veuillez remplir tous les champs requis et sélectionner un fichier.";
      this.successMessage = "";
      return;
    }
    const formData = new FormData();
    formData.append('cv', this.selectedFile);
    formData.append('competence', new Blob([JSON.stringify(this.competenceForm.value)], { type: 'application/json' }));
    this.competenceService.addCompetence(formData).subscribe({
      next: () => {
        this.successMessage = "Compétence envoyée avec succès.";
        this.errorMessage = "";
        this.resetCompetenceForm();
        this.showToast('toastSuccess');
      },
      error: err => {
        console.error(err);
        this.errorMessage = "Erreur lors de l'envoi.";
        this.successMessage = "";
        this.showToast('toastError');
      }
    });
  }

  resetCompetenceForm(): void {
    this.competenceForm.reset();
    this.selectedFile = null;
    const fileInput = document.getElementById('cvFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  showToast(id: string): void {
    const el = document.getElementById(id);
    if (el) new bootstrap.Toast(el).show();
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
        bootstrap.Modal.getInstance(document.getElementById('inscriptionModal')!)?.hide();
        this.cleanModalState();
        this.formData = { nom: '', prenom: '', telephone: '', email: '', classe: '', specialite: '' };
        this.cdRef.detectChanges();
      },
      error: err => {
        alert("Erreur lors de l'inscription ❌");
        console.error(err);
      }
    });
  }

  onFileChangepfe(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  onSubmitpfe(): void {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('sujet', new Blob([JSON.stringify(this.sujet)], { type: 'application/json' }));
    formData.append('file', this.selectedFile);
    this.http.post('http://192.168.1.54:8082/api/sujets', formData).subscribe({
      next: () => {
        alert('Sujet proposé avec succès !');
        this.resetForm();
        this.showToast('toastSuccess');
      },
      error: err => {
        alert("Erreur lors de l'envoi");
        console.error(err);
        this.showToast('toastError');
      }
    });
  }

  resetForm(): void {
    this.sujet = { nom: '', prenom: '', email: '', description: '', type: '', titre: ''  , profil: '', technologie: '' };
    this.selectedFile = null;
    const fileInput = document.getElementById('pfeFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  cleanModalState(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    if (document.body.classList.contains('modal-open')) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }
  }
}
