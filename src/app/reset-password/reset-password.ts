import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../Services/ Auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {

  resetForm!: FormGroup;
  token: string = '';
  submitted = false;

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
      Swal.fire({
        icon: 'error',
        title: 'Lien invalide',
        text: 'Le lien de réinitialisation est invalide ou expiré.',
        confirmButtonText: 'Retour',
        confirmButtonColor: '#d33'
      }).then(() => {
        this.router.navigate(['/signin']);
      });
      return;
    }

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.submitted) return;

    this.submitted = true;
    const newPassword = this.resetForm.get('newPassword')?.value;

    this.authService.resetPasswordConfirm(this.token, newPassword).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Mot de passe réinitialisé',
          text: '🎉 Votre mot de passe a été mis à jour avec succès.',
          timer: 2500,
          showConfirmButton: false
        });

        this.resetForm.reset();

        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Erreur API :', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: '❌ Une erreur est survenue lors de la réinitialisation.',
          confirmButtonText: 'Réessayer',
          confirmButtonColor: '#d33'
        });
        this.submitted = false;
      },
      complete: () => {
        this.submitted = false;
      }
    });
  }
}
