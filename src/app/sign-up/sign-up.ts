import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {
  registerForm: FormGroup;
  currentYear: number = new Date().getFullYear();

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      organisme: ['', Validators.required],
      adresse: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir tous les champs correctement.',
      });
      return;
    }

    const formData = this.registerForm.value;

    const userData = {
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      email: formData.email,
      organisme: formData.organisme,
      adresse: formData.adresse,
      password: formData.password,
    };

    this.http.post('http://192.168.1.54:8082/api/users/register', userData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie 🎉',
          text: 'Bienvenue sur notre plateforme !',
        });
        this.registerForm.reset();
      },
      error: (err) => {
        if (err.status === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Email déjà utilisé',
            text: 'Veuillez utiliser une autre adresse email.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Une erreur s'est produite lors de l'inscription.",
          });
        }
      }
    });
  }

  togglePassword(fieldId: string) {
    const passwordField = document.getElementById(fieldId) as HTMLInputElement;
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
      const eyeIcon = passwordField.nextElementSibling?.querySelector('i');
      if (eyeIcon) {
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
      }
    }
  }
}
