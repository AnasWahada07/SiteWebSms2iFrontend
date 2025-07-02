import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({


  selector: 'app-sign-up',

  standalone: true,

  imports: [

    ReactiveFormsModule,
        CommonModule,       
    HttpClientModule

  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {
  registerForm: FormGroup;
  message: string = '';
  success: boolean = false;

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
      this.message = 'Veuillez remplir correctement tous les champs.';
      this.success = false;
      return;
    }

    const userData = {
      nom: this.registerForm.value.prenom,
      prenom: this.registerForm.value.nom,
      telephone: this.registerForm.value.telephone,
      email: this.registerForm.value.email,
      organisme: this.registerForm.value.organisme,
      adresse: this.registerForm.value.adresse,
      password: this.registerForm.value.password,
    };

    this.http.post('http://localhost:8080/api/users/register', userData).subscribe({
      next: () => {
        this.message = 'Inscription réussie !';
        this.success = true;
        this.registerForm.reset();
      },
      error: (err) => {
        if (err.status === 409) {
          this.message = "Email déjà utilisé.";
        } else {
          this.message = "Erreur lors de l'inscription.";
        }
        this.success = false;
      }
    });
  }

togglePassword(fieldId: string) {
  const passwordField = document.getElementById(fieldId) as HTMLInputElement;
  
  if (passwordField) {
    // Basculer entre type 'password' et 'text'
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    
    // Optionnel: changer l'icône de l'œil
    const eyeIcon = passwordField.nextElementSibling?.querySelector('i');
    if (eyeIcon) {
      eyeIcon.classList.toggle('fa-eye');
      eyeIcon.classList.toggle('fa-eye-slash');
    }
  }
}





}
