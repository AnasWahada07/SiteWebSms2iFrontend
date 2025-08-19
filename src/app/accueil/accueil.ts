import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContactService } from '../Services/Contact.service';
import { ProjetService } from '../Services/Projet.service';
import { Projet } from '../Class/Projet';
import Swal from 'sweetalert2';
import { finalize, timeout } from 'rxjs';

type BackendAvis = {
  id: number;
  prenom: string;
  nom: string;
  email?: string | null;
  poste: string;
  societe: string;
  avis: string;
  imageName?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Testimonial = {
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  review: string;
  avatarUrl?: string | null;
};

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.css'],
})
export class Accueil implements OnInit, AfterViewInit {
  currentYear: number = new Date().getFullYear();
  isLoading = true;

  // Contact
  contactForm: FormGroup;

  // Projets (galerie)
  projets: Projet[] = [];

  // Navbar
  isNavbarCollapsed = true;

  // ====== AVIS / TÉMOIGNAGES ======
  avis: Testimonial[] = [];     // affichage dans la section
  avisForm: FormGroup;          // formulaire du modal
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  saving = false;
  modalError: string | null = null;
  modalSuccess: string | null = null;

  // API avis
  private readonly avisApi = 'https://sitewebsms2ibackend-production.up.railway.app/api/avis';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private projetService: ProjetService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdRef: ChangeDetectorRef
  ) {
    // Contact
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      consent: [false, Validators.requiredTrue],
    });

    // Avis (modal)
    this.avisForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      role: ['', [Validators.required, Validators.maxLength(150)]],
      company: ['', [Validators.required, Validators.maxLength(150)]],
      review: ['', [Validators.required, Validators.maxLength(2000)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // =======================
  //   LIFECYCLE
  // =======================
  ngOnInit(): void {
    // Projets
    this.projetService.getAllProjets().subscribe({
      next: (data) => {
        this.projets = data;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
    });

    // Google Translate uniquement côté navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleTranslate();
    }

    // Avis
    this.loadAvis();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // écoute correcte sur le BON modal
      const modalEl = document.getElementById('avisModal');
      if (modalEl) {
        modalEl.addEventListener('hidden.bs.modal', () => {
          // retire le focus “collé” (accessibilité)
          const el = document.activeElement as HTMLElement | null;
          if (el && typeof el.blur === 'function') el.blur();
          // cleanup de secours si un backdrop reste
          this.cleanupModalArtifacts();
        });
      }
    }
    this.hideBanner();
  }

  // =======================
  //   NAVBAR
  // =======================
  toggleSidebar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  // =======================
  //   CONTACT
  // =======================
  onSubmit(): void {
    if (this.contactForm.invalid) {
      Swal.fire('Erreur', 'Veuillez corriger les erreurs du formulaire.', 'error');
      return;
    }
    const contactData = this.contactForm.value;
    this.contactService.sendMessage(contactData).subscribe({
      next: () => {
        Swal.fire('✅ Message envoyé', 'Votre message a été transmis avec succès.', 'success');
        this.contactForm.reset();
      },
      error: (err) => {
        console.error('Erreur envoi :', err);
        Swal.fire('❌ Erreur', "Une erreur est survenue lors de l'envoi du message.", 'error');
      },
    });
  }

  // =======================
  //   GOOGLE TRANSLATE
  // =======================
  private initGoogleTranslate = () => {
    const w = window as any;
    if (w.google && w.google.translate) {
      new w.google.translate.TranslateElement(
        {
          pageLanguage: 'fr',
          includedLanguages: 'fr,en,es,ar,de',
          layout: w.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    }
  };

  private loadGoogleTranslate(): void {
    const w = window as any;
    if (w.google && w.google.translate) {
      this.initGoogleTranslate();
      return;
    }
    (w as any).googleTranslateElementInit = this.initGoogleTranslate;
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.defer = true;
    document.body.appendChild(script);
  }

  private hideBanner(): void {
    const bar = document.querySelector('iframe.goog-te-banner-frame') as HTMLElement | null;
    if (bar) bar.style.display = 'none';
    document.body.style.top = '0px';

    const obs = new MutationObserver(() => {
      const again = document.querySelector('iframe.goog-te-banner-frame') as HTMLElement | null;
      if (again && again.style.display !== 'none') again.style.display = 'none';
      if (document.body.style.top && document.body.style.top !== '0px') document.body.style.top = '0px';
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // =======================
  //   AVIS – DATA
  // =======================
  private mapToTestimonial(b: BackendAvis): Testimonial {
    return {
      firstName: b.prenom,
      lastName: b.nom,
      role: b.poste,
      company: b.societe,
      review: b.avis,
      avatarUrl: b.imageName ? `${this.avisApi}/files/${encodeURIComponent(b.imageName)}` : null,
    };
  }

  loadAvis(): void {
    this.http.get<BackendAvis[]>(this.avisApi).subscribe({
      next: (list) => {
        this.avis = (list || []).map((b) => this.mapToTestimonial(b));
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement avis :', err);
      },
    });
  }

  // =======================
  //   AVIS – MODAL HANDLERS
  // =======================
  onAvisFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.imagePreview = null;
      return;
    }
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(this.selectedFile);
  }

  submitAvis(): void {
    if (this.avisForm.invalid) {
      this.avisForm.markAllAsTouched();
      return;
    }

    const v = this.avisForm.value;
    const fd = new FormData();
    fd.append('prenom', v.firstName as string);
    fd.append('nom', v.lastName as string);
    fd.append('poste', v.role as string);
    fd.append('societe', v.company as string);
    fd.append('avis', v.review as string);
    fd.append('email', v.email as string);
    if (this.selectedFile) fd.append('file', this.selectedFile);

    this.saving = true;
    this.modalError = null;
    this.modalSuccess = null;

    this.http
      .post<BackendAvis>(this.avisApi, fd)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: (res) => {
          // injecte le nouvel avis en tête
          this.avis = [this.mapToTestimonial(res), ...this.avis];
          this.cdRef.detectChanges();

          // reset UI
          this.modalSuccess = 'Merci ! Votre avis a été ajouté.';
          this.avisForm.reset();
          this.selectedFile = null;
          this.imagePreview = null;

          // fermeture propre du modal + nettoyage de secours
          this.closeAvisModalSafely();
        },
        error: (err) => {
          console.error(err);
          this.modalError = 'Échec de l’envoi. Vérifiez la connexion et réessayez.';
        },
      });
  }

  // =======================
  //   MODAL HELPERS
  // =======================
  /** Ferme le modal Bootstrap s'il est chargé, puis nettoie tout backdrop résiduel (fallback). */
  private closeAvisModalSafely(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const modalEl = document.getElementById('avisModal') as HTMLElement | null;
    const bootstrap: any = (window as any).bootstrap;

    // 1) fermeture “officielle”
    if (modalEl && bootstrap?.Modal) {
      const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
      instance.hide();
    }

    // 2) cleanup de secours si un backdrop persiste
    setTimeout(() => this.cleanupModalArtifacts(), 300);
  }

  /** Nettoie les artefacts de modal (backdrops, classes body) au cas où. */
  private cleanupModalArtifacts(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');

    const modalEl = document.getElementById('avisModal') as HTMLElement | null;
    if (modalEl) {
      modalEl.classList.remove('show');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.removeAttribute('aria-modal');
      (modalEl as HTMLElement).style.display = 'none';
    }
  }
}
