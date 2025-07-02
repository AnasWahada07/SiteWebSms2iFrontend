import { Component, OnInit } from '@angular/core';
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


  inscriptions: InscriptionPFE[] = [];
  selectedInscription?: InscriptionPFE;

  constructor(private inscriptionService: ViewInscriptionService) {}

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.inscriptionService.getAll().subscribe(data => {
      this.inscriptions = data;
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



  cancelEdit(): void {
    this.selectedInscription = undefined;
  }
}

