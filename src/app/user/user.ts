import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSyncAlt,
  faEdit,
  faTrashAlt,
  faTimes,
  faSave,
  faUsersCog,
  faUserSlash,
  faCheckCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

interface UserModel {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  organisme: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class User implements OnInit, OnDestroy {
  users: UserModel[] = [];
  selectedUser: UserModel | null = null;
  isLoading = false;
  currentYear: number = new Date().getFullYear();
  private destroy$ = new Subject<void>();

  icons = {
    refresh: faSyncAlt,
    edit: faEdit,
    delete: faTrashAlt,
    close: faTimes,
    save: faSave,
    users: faUsersCog,
    noUser: faUserSlash,
    success: faCheckCircle,
    error: faExclamationCircle
  };

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.http.get<UserModel[]>('https://192.168.1.54:3350/api/users/getalluser')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.isLoading = false;
          this.cdRef.detectChanges(); // Force update
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire('Erreur', 'Échec du chargement des utilisateurs', 'error');
          console.error('❌ Erreur de chargement:', err);
        }
      });
  }

  deleteUser(id: number): void {
    Swal.fire({
      title: 'Confirmer la suppression ?',
      text: 'Cet utilisateur sera supprimé définitivement.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        this.http.delete(`https://192.168.1.54:3350/api/users/${id}`, { responseType: 'text' })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (message: string) => {
              this.users = this.users.filter(user => user.id !== id);
              this.cdRef.detectChanges(); // ✅ Mise à jour immédiate
              this.isLoading = false;
              this.selectedUser = null;

              Swal.fire({
                icon: 'success',
                title: '✅ Supprimé',
                text: message || 'Utilisateur supprimé avec succès.',
                timer: 1500,
                showConfirmButton: false
              });
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Erreur de suppression :', error);

              Swal.fire({
                icon: 'error',
                title: '❌ Erreur',
                text: 'Échec de la suppression de l\'utilisateur.',
              });
            }
          });
      }
    });
  }

  updateUser(user: UserModel): void {
    this.selectedUser = { ...user };
  }

  handleUserUpdate(updatedUser: UserModel): void {
    if (!updatedUser) return;

    this.isLoading = true;
    this.http.put(`https://192.168.1.54:3350/api/users/${updatedUser.id}`, updatedUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = { ...updatedUser };
          }
          this.selectedUser = null;
          this.isLoading = false;
          Swal.fire('✅ Mise à jour', 'Utilisateur mis à jour avec succès.', 'success');
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire('Erreur', 'Échec de la mise à jour de l\'utilisateur.', 'error');
          console.error('❌ Erreur backend :', err);
        }
      });
  }

  cancelModal(): void {
    this.selectedUser = null;
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  refreshUsers(): void {
    this.loadUsers();
    Swal.fire('Actualisé', 'Liste actualisée avec succès.', 'success');
  }
}
