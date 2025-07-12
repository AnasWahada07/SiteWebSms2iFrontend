import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  errorMessage = '';
  successMessage = '';
  selectedUser: UserModel | null = null;
  isLoading = false;

  private destroy$ = new Subject<void>(); 

  // Font Awesome icons
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.http.get<UserModel[]>('http://192.168.1.54:8082/api/users/getalluser')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Échec du chargement des utilisateurs';
          console.error('❌ Erreur de chargement:', err);
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  deleteUser(id: number): void {
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
    if (!confirmDelete) return;

    this.isLoading = true;
    this.http.delete(`http://192.168.1.54:8082/api/users/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
          this.successMessage = 'Utilisateur supprimé avec succès !';
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Échec de la suppression de l\'utilisateur';
          console.error('❌ Erreur lors de la suppression :', err);
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  updateUser(user: UserModel): void {
    this.selectedUser = { ...user };
  }

  handleUserUpdate(updatedUser: UserModel): void {
    if (!updatedUser) return;

    this.isLoading = true;
    this.http.put(`http://192.168.1.54:8082/api/users/${updatedUser.id}`, updatedUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = { ...updatedUser };
          }
          this.successMessage = 'Utilisateur mis à jour avec succès !';
          this.selectedUser = null;
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Échec de la mise à jour de l\'utilisateur';
          console.error('❌ Erreur backend :', err);
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  cancelModal(): void {
    this.selectedUser = null;
  }

  refreshUsers(): void {
    this.loadUsers();
    this.successMessage = 'Liste actualisée avec succès';
    setTimeout(() => this.successMessage = '', 2000);
  }
}
