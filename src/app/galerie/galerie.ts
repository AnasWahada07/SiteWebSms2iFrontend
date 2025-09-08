import { ChangeDetectorRef, Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { GalerieService } from '../Services/Galerie.service';
import { Galeries } from '../Class/Galeries';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-galerie',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './galerie.html',
  styleUrl: './galerie.css'
})
export class Galerie implements OnInit {

  currentYear: number = new Date().getFullYear();

  galeries: Galeries[] = [];
  searchTerm: string = '';
  isNavbarCollapsed: boolean = true;

  constructor(
    private galerieService: GalerieService,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.galerieService.getAll().subscribe(data => {
      this.galeries = data;
      this.cdRef.detectChanges();
    });

    // ➜ Charger Google Translate uniquement côté navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleTranslate();
    }
  }

  filteredGaleries() {
    if (!this.searchTerm) return this.galeries;

    const lowerSearch = this.searchTerm.toLowerCase();
    return this.galeries.filter(g =>
      g.title.toLowerCase().includes(lowerSearch) ||
      g.client.toLowerCase().includes(lowerSearch)
    );
  }

  toggleSidebar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  /** =============== Google Translate =============== */
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
      // optionnel : masquer la barre bleue
      this.hideGTranslateBar();
    }
  };

  private loadGoogleTranslate(): void {
    const w = window as any;

    // Déjà chargé ailleurs ? On initialise seulement
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

  // (optionnel) cache la barre bleue "Google Traduction" en haut
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
