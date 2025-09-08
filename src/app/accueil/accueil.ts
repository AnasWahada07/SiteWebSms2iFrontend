import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
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
export class Accueil implements OnInit, AfterViewInit, OnDestroy {
  currentYear: number = new Date().getFullYear();
  isLoading = true;

  // Contact
  contactForm: FormGroup;

  // Projets (galerie)
  projets: Projet[] = [];

  // Navbar
  isNavbarCollapsed = true;

  // ====== AVIS / TÉMOIGNAGES ======
  avis: Testimonial[] = [];
  avisForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  saving = false;
  modalError: string | null = null;
  modalSuccess: string | null = null;

  // API avis
  private readonly avisApi = 'https://anas-wahada1997.alwaysdata.net/api/avis';

  // ====== TRADUCTION (Popover) ======
  isTranslateOpen = false;
  // Ton menu custom (les codes doivent exister dans includedLanguages)
  languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'tr', label: 'Türkçe' },
  ];

  private selectObserver?: MutationObserver;
  private outsideClickHandler?: (e: MouseEvent) => void;
  private keydownHandler?: (e: KeyboardEvent) => void;
  private resizeHandler?: () => void;
  private scrollHandler?: () => void;

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
      const modalEl = document.getElementById('avisModal');
      if (modalEl) {
        modalEl.addEventListener('hidden.bs.modal', () => {
          const el = document.activeElement as HTMLElement | null;
          if (el && typeof el.blur === 'function') el.blur();
          this.cleanupModalArtifacts();
        });
      }

      // S'assurer que le popover est directly sous <body> (évite les parents positionnés)
      const pop = document.getElementById('gt-popover');
      if (pop && pop.parentElement !== document.body) {
        document.body.appendChild(pop);
      }

      // Observe l’injection du <select> Google pour fermer après choix et binder une fois
      const host = document.getElementById('google_translate_element');
      if (host) {
        this.selectObserver = new MutationObserver(() => {
          const sel = host.querySelector('select.goog-te-combo') as HTMLSelectElement | null;
          if (sel && !(sel as any)._gtBound) {
            sel.addEventListener('change', () => setTimeout(() => this.closeTranslate(), 120));
            (sel as any)._gtBound = true;
          }
        });
        this.selectObserver.observe(host, { childList: true, subtree: true });
      }
    }

    this.hideBanner();
  }

  ngOnDestroy(): void {
    this.detachGlobalListeners();
    if (this.selectObserver) this.selectObserver.disconnect();
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
          includedLanguages: 'fr,en,es,ar,de,it,pt,tr', 
          layout: w.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
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
    (document.body as any).style.top = '0px';

    const obs = new MutationObserver(() => {
      const again = document.querySelector('iframe.goog-te-banner-frame') as HTMLElement | null;
      if (again && again.style.display !== 'none') again.style.display = 'none';
      if ((document.body as any).style.top && (document.body as any).style.top !== '0px')
        (document.body as any).style.top = '0px';
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
    this.avisForm.markAllAsTouched();

    if (this.avisForm.invalid) {
      const invalidControl = document.querySelector('.ng-invalid');
      if (invalidControl) {
        invalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
          this.avis = [this.mapToTestimonial(res), ...this.avis];
          this.cdRef.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Merci !',
            text: 'Votre avis a été ajouté avec succès.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          this.avisForm.reset();
          this.selectedFile = null;
          this.imagePreview = null;

          this.closeAvisModalSafely();
        },
        error: (err) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Échec de l'envoi. Vérifiez la connexion et réessayez.",
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK',
          });
        },
      });
  }

  // =======================
  //   MODAL HELPERS
  // =======================
  private closeAvisModalSafely(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const modalEl = document.getElementById('avisModal') as HTMLElement | null;
    const bootstrap: any = (window as any).bootstrap;

    if (modalEl && bootstrap?.Modal) {
      const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
      instance.hide();
    }

    setTimeout(() => this.cleanupModalArtifacts(), 300);
  }

  private cleanupModalArtifacts(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    document.body.classList.remove('modal-open');
    (document.body as any).style.removeProperty('padding-right');

    const modalEl = document.getElementById('avisModal') as HTMLElement | null;
    if (modalEl) {
      modalEl.classList.remove('show');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.removeAttribute('aria-modal');
      (modalEl as HTMLElement).style.display = 'none';
    }
  }

  // =======================
  //   BLUR HANDLER (Avis)
  // =======================
  onFieldBlur(fieldName: string): void {
    const control = this.avisForm.get(fieldName);
    if (control && control.invalid) {
      control.markAsTouched();
      this.cdRef.detectChanges();
    }
  }

  // =======================
  //   TRADUCTION – POPOVER
  // =======================
  toggleTranslate(ev: Event): void {
    ev.preventDefault();
    this.isTranslateOpen ? this.closeTranslate() : this.openTranslate();
  }

  private openTranslate(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const btn = document.getElementById('translateToggle');
    const pop = document.getElementById('gt-popover');
    if (!btn || !pop) return;

    pop.classList.remove('d-none');
    this.isTranslateOpen = true;
    (btn as HTMLElement).setAttribute('aria-expanded', 'true');

    // Laisse le temps au layout d'afficher le popover pour mesurer sa largeur
    requestAnimationFrame(() => this.positionPopover(btn, pop));

    // Listeners globaux pour fermer/ajuster
    this.outsideClickHandler = (e: MouseEvent) => {
      if (!pop.contains(e.target as Node) && !btn.contains(e.target as Node)) this.closeTranslate();
    };
    this.keydownHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.closeTranslate(); };
    this.resizeHandler = () => this.positionPopover(btn, pop);
    this.scrollHandler = () => this.positionPopover(btn, pop);

    document.addEventListener('click', this.outsideClickHandler, { capture: true });
    document.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  private closeTranslate(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const btn = document.getElementById('translateToggle');
    const pop = document.getElementById('gt-popover');

    if (pop) pop.classList.add('d-none');
    if (btn) (btn as HTMLElement).setAttribute('aria-expanded', 'false');
    this.isTranslateOpen = false;

    this.detachGlobalListeners();
  }

  private positionPopover(btnEl: HTMLElement, popEl: HTMLElement): void {
    // popEl est en position: fixed → on utilise les coords viewport
    const r = btnEl.getBoundingClientRect();
    const top = r.bottom + 8; // 8px sous le bouton

    const viewportW = document.documentElement.clientWidth;
    const popWidth = popEl.offsetWidth || 280;
    const maxLeft = viewportW - popWidth - 8;
    const minLeft = 8;
    const idealLeft = r.left;
    const left = Math.min(maxLeft, Math.max(minLeft, idealLeft));

    popEl.style.top = `${top}px`;
    popEl.style.left = `${left}px`;

    // position de la flèche
    const arrow = popEl.querySelector('.gt-arrow') as HTMLElement | null;
    if (arrow) {
      const btnCenter = r.left + r.width / 2;
      const rel = Math.max(12, Math.min(popWidth - 12, btnCenter - left));
      arrow.style.left = `${rel}px`;
    }
  }

  private detachGlobalListeners(): void {
    if (this.outsideClickHandler)
      document.removeEventListener('click', this.outsideClickHandler, { capture: true } as any);
    if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler as any);

    this.outsideClickHandler = this.keydownHandler = this.resizeHandler = this.scrollHandler = undefined;
  }

  // =======================
  //   TRADUCTION – ACTION
  // =======================
  chooseLang(code: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // 1) Sélection directe via le <select> Google si présent
    const combo = document.querySelector('#google_translate_element select.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
      setTimeout(() => this.closeTranslate(), 120);
      return;
    }

    // 2) Fallback cookie (si le select n’est pas encore injecté)
    const from = 'fr'; // langue source du site
    const path = '/';
    document.cookie = `googtrans=/${from}/${code}; path=${path}`;
    document.cookie = `googtrans=/${from}/${code}; path=${path}; domain=.${location.hostname}`;
    location.reload();
  }
}