import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InscriptionPFE, ViewInscriptionService } from '../Services/ViewInscription.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-inscription',
  imports: [


    HttpClientModule , 
    ReactiveFormsModule , 
    FormsModule,
    CommonModule,



  ],
  templateUrl: './view-inscription.html',
  styleUrl: './view-inscription.css'
})
export class ViewInscription implements OnInit {

  searchQuery: string = '';
  inscriptionsOriginal: InscriptionPFE[] = []; 

        currentYear: number = new Date().getFullYear();


  inscriptions: InscriptionPFE[] = [];
  selectedInscription?: InscriptionPFE;

  constructor(private inscriptionService: ViewInscriptionService , private cdRef: ChangeDetectorRef) {}


  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.inscriptionService.getAll().subscribe(data => {
      this.inscriptions = data;
            this.cdRef.detectChanges(); 
        this.inscriptionsOriginal = data;
       this.inscriptions = [...this.inscriptionsOriginal];

      this.cdRef.detectChanges(); 
    });
  }


  deleteInscription(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette inscription ?')) {
      this.inscriptionService.delete(id).subscribe(() => {
        this.loadInscriptions();
      });
    }
  }

  editInscription(inscription: InscriptionPFE): void {
    this.selectedInscription = { ...inscription }; // clone
  }

saveModification(): void {
  if (!this.selectedInscription) return;

  this.inscriptionService.update(this.selectedInscription.id, this.selectedInscription).subscribe(() => {
    this.selectedInscription = undefined;
    this.loadInscriptions();
  });
}

applyFilter(): void {
  const query = this.searchQuery.toLowerCase().trim();

  this.inscriptions = this.inscriptionsOriginal.filter(i =>
    (i.nom && i.nom.toLowerCase().includes(query)) ||
    (i.prenom && i.prenom.toLowerCase().includes(query)) ||
    (i.classe && i.classe.toLowerCase().includes(query)) ||
    (i.sujetTitre && i.sujetTitre.toLowerCase().includes(query))
  );
}

  resetFilter(): void {
    this.searchQuery = '';
    this.inscriptions = [...this.inscriptionsOriginal];
  }



  cancelEdit(): void {
    this.selectedInscription = undefined;
  }
}

