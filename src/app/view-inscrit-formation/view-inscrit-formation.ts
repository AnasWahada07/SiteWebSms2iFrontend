import { ChangeDetectorRef, Component } from '@angular/core';
import { InscriptionFormation } from '../Class/InscriptionFormation';
import { FormationService } from '../Services/Formation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-inscrit-formation',
  imports: [CommonModule , FormsModule], 
  templateUrl: './view-inscrit-formation.html',
  styleUrl: './view-inscrit-formation.css'
})
export class ViewInscritFormation {

  inscriptions: InscriptionFormation[] = [];

  constructor(private inscriptionService: FormationService , private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadInscriptions();
  }

loadInscriptions(): void {
  this.inscriptionService.getAll().subscribe(data => {
    this.inscriptions = data;
    this.cdRef.detectChanges(); 
  });
}

deleteInscription(id?: number): void {
  if (!id) return; 

  if (confirm('Confirmer la suppression ?')) {
    this.inscriptionService.delete(id).subscribe(() => {
      this.inscriptions = this.inscriptions.filter(insc => insc.id !== id);
    });
  }
}
  }

