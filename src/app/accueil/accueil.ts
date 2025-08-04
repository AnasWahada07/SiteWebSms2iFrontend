import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService } from '../Services/Contact.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProjetService } from '../Services/Projet.service';
import { Projet } from '../Class/Projet';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.css']
})
export class Accueil implements OnInit {

  currentYear: number = new Date().getFullYear();
  isLoading: boolean = true;
  contactForm: FormGroup;
  projets: Projet[] = [];
isNavbarCollapsed: boolean = true;


  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private projetService: ProjetService,
    private sanitizer: DomSanitizer,
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

ngOnInit(): void {
  this.projetService.getAllProjets().subscribe({
    next: (data) => {
      this.projets = data;
      this.isLoading = false;
      this.cdRef.detectChanges();
    },
    error: (err) => {
      this.isLoading = false;
      this.cdRef.detectChanges();

     // console.error('Erreur de chargement des projets', err);

      if (err.status === 401) {
        // rien : géré par l’intercepteur
        return;
      }

      // Swal.fire({
      //   icon: 'error',
      //   title: 'Erreur de chargement',
      //   text: `Impossible de récupérer les projets (${err.status || 'inconnu'})`,
      //   confirmButtonText: 'OK'
      // });
    }
  });
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
      next: (res) => {
        Swal.fire('✅ Message envoyé', 'Votre message a été transmis avec succès.', 'success');
        this.contactForm.reset();
      },
      error: (err) => {
        console.error('Erreur envoi :', err);
        Swal.fire('❌ Erreur', 'Une erreur est survenue lors de l\'envoi du message.', 'error');
      }
    });
  }
}
