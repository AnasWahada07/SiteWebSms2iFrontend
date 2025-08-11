import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Competence } from '../Class/Competence';
import { CompetenceService } from '../Services/Competence.service';

@Component({
  selector: 'app-viewcompetence',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewcompetence.html',
  styleUrl: './viewcompetence.css'
})
export class Viewcompetence implements OnInit {
  private competenceService = inject(CompetenceService);

  competences = signal<Competence[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCompetences();
  }

  loadCompetences() {
    this.loading.set(true);
    this.error.set(null);
    this.competenceService.getAllCompetences().subscribe({
      next: (data) => {
        this.competences.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur de chargement des compétences.');
        this.loading.set(false);
      }
    });
  }

  deleteCompetence(c: Competence) {
    if (!c.id) {
      alert('Impossible de supprimer : ID manquant.');
      return;
    }
    if (!confirm(`Supprimer ${c.nom} ${c.prenom} ?`)) return;

    this.loading.set(true);
    this.competenceService.deleteCompetence(c.id).subscribe({
      next: () => {
        this.competences.set(this.competences().filter(x => x.id !== c.id));
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur lors de la suppression.');
        this.loading.set(false);
      }
    });
  }

  /** Variante 1: lien direct */
  cvUrl(c: Competence): string | null {
    return c.id ? this.competenceService.getCvUrl(c.id) : null;
  }

  /** Variante 2: téléchargement via Blob (si besoin de gérer auth/headers) */
  downloadCv(c: Competence) {
    if (!c.id) return;
    this.competenceService.downloadCv(c.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = c.fileName || `cv-${c.id}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur lors du téléchargement du CV.');
      }
    });
  }

  getFileUrl(fileName?: string | null) {
  return fileName ? this.competenceService.getFileUrl(fileName) : null;
}

}
