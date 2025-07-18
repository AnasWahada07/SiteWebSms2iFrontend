import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../Services/ Auth.service';
import { AuthResponse } from '../Class/AuthResponse';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
const savedEmail = localStorage.getItem('rememberedEmail');
console.log('📥 Email chargé depuis localStorage :', savedEmail);

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
    localStorage.setItem('rememberedEmail', email); // ⬅️ SAUVEGARDE
    const toast = document.getElementById('rememberToast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  } else {
    localStorage.removeItem('rememberedEmail'); // ⬅️ SUPPRESSION si décoché
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
      alert('Réponse invalide du serveur.');
      return;
    }

    this.authService.setUser(res);

    // ✅ Attendre un peu avant redirection
    setTimeout(() => {
      if (res.role.toLowerCase() === 'admin') {
        this.router.navigate(['/Admin']);
      } else {
        alert('Accès refusé : vous n\'êtes pas administrateur.');
        this.router.navigate(['/acceuil']);
      }
    }, 50); // délai très court pour laisser le temps au navigateur d'écrire dans localStorage
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
