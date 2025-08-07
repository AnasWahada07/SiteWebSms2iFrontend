import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../Services/ Auth.service';
import { AuthResponse } from '../Class/AuthResponse';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
})
export class SignIn {
  loginForm: FormGroup;
  showPassword = false;
  isSubmitting = false;
  currentYear: number = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    const savedEmail = localStorage.getItem('rememberedEmail');
    this.loginForm = this.fb.group({
      email: [savedEmail ?? '', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [!!savedEmail]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onRememberMeChange(): void {
    const checked = this.loginForm.get('rememberMe')?.value;
    const email = this.loginForm.get('email')?.value;

    if (checked && email && this.loginForm.get('email')?.valid) {
      localStorage.setItem('rememberedEmail', email); 
      const toast = document.getElementById('rememberToast');
      if (toast) {
        toast.style.display = 'block';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 4000);
      }
    } else {
      localStorage.removeItem('rememberedEmail'); 
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login(email, password).subscribe({
      next: (res: AuthResponse) => {
        this.isSubmitting = false;

        if (!res || !res.role) {
          Swal.fire('Erreur', 'Réponse invalide du serveur.', 'error');
          return;
        }

        this.authService.setUser(res);

        if (res.role.toLowerCase() === 'admin') {
          Swal.fire({
            icon: 'success',
            title: 'Connexion réussie 🎉',
            text: 'Bienvenue dans votre espace Admin !',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/Admin']));
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Accès refusé',
            text: 'Vous n’êtes pas autorisé à accéder à l’espace Admin.'
          }).then(() => this.router.navigate(['/acceuil']));
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        Swal.fire('Échec de connexion', 'Email ou mot de passe incorrect.', 'error');
        console.error(err);
      }
    });
  }

  onForgetPassword() {
    const email = this.loginForm.get('email')?.value;

    if (!email || !this.loginForm.get('email')?.valid) {
      Swal.fire('Attention', 'Veuillez entrer une adresse email valide.', 'warning');
      return;
    }

    this.authService.resetPassword(email).subscribe({
      next: (res: string) => {
        Swal.fire('Succès', res, 'success');
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Erreur', 'Erreur lors de la demande de réinitialisation.', 'error');
      }
    });
  }
}
