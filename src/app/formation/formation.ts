import { ChangeDetectorRef, Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormationService } from '../Services/Formation.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormationsParTypeDTO } from '../Class/FormationsParTypeDTO';

@Component({
  selector: 'app-formation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './formation.html',
  styleUrl: './formation.css'
})
export class Formation implements OnInit {

  currentYear: number = new Date().getFullYear();

  formations!: FormationsParTypeDTO;
  selectedFormation: any = null;

  constructor(
    private formationService: FormationService,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.formationService.getFormationsParType().subscribe({
      next: data => this.formations = data,
      complete: () => this.cdRef.detectChanges(),
      error: err => console.error('Erreur chargement formations', err)
    });

    // ➜ Traduction : charger le widget uniquement côté navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleTranslate();
    }
  }

  openFormationDetails(formation: any): void {
    this.selectedFormation = formation;
  }

  /** ===================== Google Translate ===================== */
  private initGoogleTranslate = () => {
    const w = window as any;
    if (w.google && w.google.translate) {
      new w.google.translate.TranslateElement(
        {
          pageLanguage: 'fr',
          includedLanguages: 'fr,en,es,ar,de,it,pt,tr',
          layout: w.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
      this.hideGTranslateBar(); // optionnel : masque la barre bleue
    }
  };

  private loadGoogleTranslate(): void {
    const w = window as any;

    // Si déjà chargé (depuis une autre page), initialiser seulement
    if (w.google && w.google.translate) {
      this.initGoogleTranslate();
      return;
    }

    // Callback globale appelée par Google
    w.googleTranslateElementInit = this.initGoogleTranslate;

    // Éviter les doublons
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.defer = true;
    document.body.appendChild(script);
  }

  // (optionnel) cache la barre bleue Google en haut
  private hideGTranslateBar(): void {
    const bar = document.querySelector('iframe.goog-te-banner-frame') as HTMLElement | null;
    if (bar) bar.style.display = 'none';
    document.body.style.top = '0px';

    const obs = new MutationObserver(() => {
      const again = document.querySelector('iframe.goog-te-banner-frame') as HTMLElement | null;
      if (again && again.style.display !== 'none') again.style.display = 'none';
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
}
