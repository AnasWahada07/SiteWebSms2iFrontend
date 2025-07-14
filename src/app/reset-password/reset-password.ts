import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../Services/ Auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {



  resetForm!: FormGroup;
  token: string = '';
  submitted = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.token = this.route.snapshot.queryParamMap.get('token') || '';
  console.log('🔐 Token reçu depuis l’URL :', this.token);

  if (!this.token) {
    this.errorMessage = 'Lien invalide ou expiré.';
    return;
  }

  this.resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });
}

onSubmit(): void {
  this.successMessage = '';
  this.errorMessage = '';

  if (this.resetForm.invalid || this.submitted) {
    return;
  }

  this.submitted = true; 

  const newPassword = this.resetForm.get('newPassword')?.value;

  this.authService.resetPasswordConfirm(this.token, newPassword).subscribe({
    next: () => {
      this.successMessage = '🎉 Votre mot de passe a été réinitialisé avec succès.';
      this.resetForm.reset();

      setTimeout(() => {
        this.router.navigate(['/signin']);
      }, 3000);
    },
    error: (err) => {
      console.error('Erreur API:', err);
      this.errorMessage = '❌ Erreur lors de la réinitialisation du mot de passe.';
      this.submitted = false; 
    },
    complete: () => {
      this.submitted = false; 
    }
  });
}
}
