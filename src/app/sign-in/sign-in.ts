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

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('userId', res.userId?.toString() || '');
          localStorage.setItem('role', res.role);

          if (res.role?.toLowerCase() === 'admin') {
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
      alert(res); // res est un string retourné depuis Spring Boot
    },
    error: (err) => {
      console.error(err);
      alert('Erreur lors de la demande de réinitialisation.');
    }
  });
}
}
