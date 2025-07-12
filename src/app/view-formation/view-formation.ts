import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ViewFormationService, SujetPFE } from '../Services/ViewFormation.service';

@Component({
  selector: 'app-view-formation',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './view-formation.html',
  styleUrls: ['./view-formation.css']
})
export class ViewFormation implements OnInit {
  sujets: SujetPFE[] = [];
  selectedSujet: SujetPFE | null = null;

  statutOptions = ['CONFIRMEE', 'EN_ATTENTE', 'REJETEE'];

  constructor(private service: ViewFormationService) {}

  ngOnInit(): void {
    this.loadSujets();
  }

  loadSujets(): void {
    this.service.getAllSujets().subscribe(data => {
      this.sujets = data;
    });
  }

  delete(id: number): void {
    this.service.deleteSujet(id).subscribe(() => {
      this.sujets = this.sujets.filter(s => s.id !== id);
      if (this.selectedSujet?.id === id) {
        this.selectedSujet = null;
      }
    });
  }

  selectSujet(sujet: SujetPFE): void {
    this.selectedSujet = { ...sujet };
  }

  updateSelectedSujet(): void {
    if (!this.selectedSujet) return;

    this.service.updateSujet(this.selectedSujet.id, this.selectedSujet).subscribe({
      next: () => {
        alert('Sujet mis à jour avec succès.');
        this.loadSujets();
        this.selectedSujet = null;
      },
      error: err => {
        console.error('Erreur update:', err);
      }
    });
  }

  cancelEdit(): void {
    this.selectedSujet = null;
  }

  getFileUrl(fileName: string): string {
    return `http://192.168.1.54:8082/api/sujets/files/${fileName}`;
  }
}
