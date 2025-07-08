import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../Services/ Auth.service';
import { AuthResponse } from '../Class/AuthResponse';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
})
export class SignIn {
  loginForm: FormGroup;
  showPassword = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res: AuthResponse) => {
        this.isSubmitting = false;

        if (!res || !res.role) {
          alert('Réponse invalide du serveur.');
          return;
        }

        // ✅ Stocker tous les champs du backend (incl. nom, prenom, userId)
        this.authService.setUser(res);

        console.log('📦 Utilisateur connecté :', res.nom, res.prenom);

        if (res.role.toLowerCase() === 'admin') {
          this.router.navigate(['/Admin']);
        } else {
          alert('Accès refusé : vous n\'êtes pas administrateur.');
          this.router.navigate(['/acceuil']);
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        alert('Email ou mot de passe incorrect.');
        console.error(err);
      }
    });
  }

  onForgetPassword() {
    const email = this.loginForm.get('email')?.value;

    if (!email || !this.loginForm.get('email')?.valid) {
      alert('Veuillez entrer une adresse email valide.');
      return;
    }

    this.authService.resetPassword(email).subscribe({
      next: (res: string) => {
        alert(res);
      },
      error: (err: any) => {
        console.error(err);
        alert('Erreur lors de la demande de réinitialisation.');
      }
    });
  }
}
