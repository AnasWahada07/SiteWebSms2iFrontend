import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service.html',
  styleUrls: ['./service.css']
})
export class Service implements OnInit {

  // props déjà utilisées dans ton template
  isNavbarCollapsed = true;
  currentYear = new Date().getFullYear();
  startYear = 2008;
  experienceYears = this.currentYear - this.startYear;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleTranslate();
    }
  }

  toggleSidebar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  /** ============ Google Translate ============ */
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
      this.hideGTranslateBar(); // optionnel
    }
  };

  private loadGoogleTranslate(): void {
    const w = window as any;

    // si déjà chargé sur une autre page
    if (w.google && w.google.translate) {
      this.initGoogleTranslate();
      return;
    }

    // callback globale appelée par Google
    w.googleTranslateElementInit = this.initGoogleTranslate;

    // éviter les doublons
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.defer = true;
    document.body.appendChild(script);
  }

  // (optionnel) masque la barre bleue de Google en haut de page
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
