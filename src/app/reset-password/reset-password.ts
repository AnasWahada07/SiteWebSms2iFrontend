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
  token!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.resetForm.valid) {
      const newPassword = this.resetForm.value.newPassword;

      this.authService.updatePassword(this.token, newPassword).subscribe({
        next: () => {
          alert('Mot de passe modifié avec succès.');
          this.router.navigate(['/']);
        },
        error: () => {
          alert('Erreur lors de la mise à jour du mot de passe.');
        }
      });
    }
  }

}
