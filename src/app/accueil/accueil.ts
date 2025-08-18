import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContactService } from '../Services/Contact.service';
import { ProjetService } from '../Services/Projet.service';
import { Projet } from '../Class/Projet';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.css']
})
export class Accueil implements OnInit , AfterViewInit {

  currentYear: number = new Date().getFullYear();
  isLoading: boolean = true;
  contactForm: FormGroup;
  projets: Projet[] = [];
  isNavbarCollapsed: boolean = true;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private projetService: ProjetService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdRef: ChangeDetectorRef
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      consent: [false, Validators.requiredTrue]
    });
  }

    ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const modalEl = document.getElementById('histoireModal');
      if (modalEl) {
        modalEl.addEventListener('hidden.bs.modal', () => {
          const el = document.activeElement as HTMLElement | null; 
          if (el && typeof el.blur === 'function') {
            el.blur();
          }
        });
      }
    }
          this.hideBanner();

  }




  ngOnInit(): void {
    // Charger les projets
    this.projetService.getAllProjets().subscribe({
      next: (data) => {
        this.projets = data;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });

    // Charger Google Translate uniquement côté navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleTranslate();
    }
  }

  toggleSidebar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

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
        Swal.fire('❌ Erreur', 'Une erreur est survenue lors de l\'envoi du message.', 'error');
      }
    });
  }

  /** --------- Google Translate --------- */
  private initGoogleTranslate = () => {
    const w = window as any;
    if (w.google && w.google.translate) {
      new w.google.translate.TranslateElement(
        {
          pageLanguage: 'fr',
          includedLanguages: 'fr,en,es,ar,de',
          layout: w.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
    }
  };

  private loadGoogleTranslate(): void {
    const w = window as any;

    // Si déjà chargé, on initialise directement
    if (w.google && w.google.translate) {
      this.initGoogleTranslate();
      return;
    }

    // Callback global appelée par Google
    w.googleTranslateElementInit = this.initGoogleTranslate;

    // Éviter les doublons si on revient sur la page
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


}
