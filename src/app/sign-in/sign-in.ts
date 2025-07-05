import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../Services/ Auth.service';

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
  if (this.loginForm.invalid) return;

  const { email, password } = this.loginForm.value;

this.authService.login(email, password).subscribe({
  next: (res) => {
    console.log('✅ Connexion réussie');

    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', res.userId.toString());
    localStorage.setItem('role', res.role);
    localStorage.setItem('nom', res.nom || '');
    localStorage.setItem('prenom', res.prenom || '');
    localStorage.setItem('username', `${res.prenom} ${res.nom}`.trim());
      if (res.role.toLowerCase() === 'admin') {
        this.router.navigate(['/Admin']);
      } else {
        alert('Accès refusé : vous n\'êtes pas administrateur.');
        this.router.navigate(['/acceuil']);
      }
    }, 
    error: () => {
      alert('Email ou mot de passe incorrect.');
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
      console.log(res); 
      alert(res); 
    },
    error: (err) => {
      console.error(err);
      alert('Erreur lors de la demande de réinitialisation.');
    }
  });
}
}
