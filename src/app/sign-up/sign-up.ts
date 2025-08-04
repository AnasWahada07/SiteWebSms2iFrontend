import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

/** 🔐 Validation du mot de passe complexe */
export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasDigit = /[0-9]/.test(value);
    const hasSpecialChar = /[\W_]/.test(value);
    const isValidLength = value.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar && isValidLength;

    return valid ? null : {
      passwordComplexity: {
        hasUpperCase,
        hasLowerCase,
        hasDigit,
        hasSpecialChar,
        isValidLength
      }
    };
  };
}

/** 🧩 Vérifie si les deux mots de passe correspondent */
export function passwordMatchValidator(form: FormGroup): ValidationErrors | null {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp implements OnInit {
  registerForm: FormGroup;
  currentYear: number = new Date().getFullYear();

  // 🔎 Données pour jauge de mot de passe
  passwordStrength: number = 0;
  passwordStrengthLabel: string = '';
  passwordStrengthColor: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      organisme: ['', Validators.required],
      adresse: ['', Validators.required],
      password: ['', [Validators.required, passwordComplexityValidator()]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

ngOnInit(): void {
  Swal.fire({
    icon: 'warning',
    title: '⚠️ Accès restreint',
    text: 'Ce compte vous permettra accéder au tableau de bord administrateur, sous réserve de validation par  administrateur.',
    confirmButtonText: 'Compris',
    confirmButtonColor: '#d33'  
  });
}

  /** 🔄 Met à jour la jauge de force du mot de passe */
  checkPasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[\W_]/.test(password)) score++;

    this.passwordStrength = (score / 5) * 100;

    if (score <= 2) {
      this.passwordStrengthLabel = 'Faible';
      this.passwordStrengthColor = 'bg-danger';
    } else if (score === 3 || score === 4) {
      this.passwordStrengthLabel = 'Moyen';
      this.passwordStrengthColor = 'bg-warning';
    } else if (score === 5) {
      this.passwordStrengthLabel = 'Fort';
      this.passwordStrengthColor = 'bg-success';
    }
  }

  /** 🔐 Validation et envoi du formulaire */
  onSubmit(): void {
    if (this.registerForm.invalid) {
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

    this.http.post('https://192.168.1.54:3350/api/users/register', userData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie 🎉',
          text: 'Bienvenue sur notre plateforme !',
        });
        this.registerForm.reset();
        this.passwordStrength = 0;
        this.passwordStrengthLabel = '';
        this.passwordStrengthColor = '';
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

  /** 👁 Affiche/masque le mot de passe */
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
