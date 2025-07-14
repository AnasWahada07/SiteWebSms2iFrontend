import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService } from '../Services/Contact.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProjetService } from '../Services/Projet.service';
import { Projet } from '../Class/Projet';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-accueil',
  imports: [

        ReactiveFormsModule,
        HttpClientModule ,
        CommonModule


  ],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css'
})
export class Accueil implements OnInit  {

  currentYear: number = new Date().getFullYear();

  isLoading: boolean = true;
  


    contactForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  projets: Projet[] = [];

    constructor(private fb: FormBuilder, private contactService: ContactService , private projetService: ProjetService ,  private sanitizer: DomSanitizer , 
          @Inject(PLATFORM_ID) private platformId: Object , private cdRef: ChangeDetectorRef

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

      this.cdRef.detectChanges(); // 🔁 force Angular à re-rendre le DOM
    },
    error: (err) => {
      console.error('Erreur de chargement', err);
      this.isLoading = false;
      this.cdRef.detectChanges(); // même en cas d'erreur
    }
  });
}






onSubmit(): void {
  if (this.contactForm.valid) {
    const contactData = this.contactForm.value;

    this.contactService.sendMessage(contactData).subscribe({
      next: (res) => {
        this.successMessage = res;
        this.errorMessage = '';
        this.contactForm.reset();
      },
      error: (err) => {
        console.error('Erreur envoi :', err);
        this.successMessage = '';
        this.errorMessage = "❌ Une erreur est survenue lors de l'envoi du message.";
      }
    });
  } else {
    this.successMessage = '';
    this.errorMessage = "Veuillez corriger les erreurs du formulaire.";
  }
}
}
