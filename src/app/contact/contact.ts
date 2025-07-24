import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ContactService } from '../Services/Contact.service';
import { Contact } from '../Class/Contact';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contacts implements OnInit {
  contacts: Contact[] = [];
  editForm!: FormGroup;
  selectedContact: Contact | null = null;

  searchQuery: string = '';
  contactsOriginal: Contact[] = [];

  currentYear: number = new Date().getFullYear();

  constructor(
    private contactService: ContactService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getContacts();

    this.editForm = this.fb.group({
      name: [''],
      email: [''],
      subject: [''],
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/Admin']);
  }

  getContacts(): void {
    this.contactService.getAllContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        this.cdRef.detectChanges();
        this.contactsOriginal = [...data];
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de charger les contacts.', 'error');
      },
    });
  }

  applyContactFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.contacts = this.contactsOriginal.filter(contact =>
      (contact.name && contact.name.toLowerCase().includes(query)) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.subject && contact.subject.toLowerCase().includes(query))
    );
  }

  resetContactFilter(): void {
    this.searchQuery = '';
    this.contacts = [...this.contactsOriginal];
  }

  deleteContact(contact: Contact): void {
    Swal.fire({
      title: 'Supprimer le contact ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.contactService.deleteContact(contact.id!).subscribe({
          next: () => {
            this.contacts = this.contacts.filter(c => c.id !== contact.id);
            Swal.fire('Supprimé', 'Le contact a été supprimé avec succès.', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
          }
        });
      }
    });
  }
}
