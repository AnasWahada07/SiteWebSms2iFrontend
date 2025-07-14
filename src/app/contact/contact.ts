import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ContactService } from '../Services/Contact.service';
import { Contact } from '../Class/Contact';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contacts implements OnInit {
  contacts: Contact[] = [];
  editForm!: FormGroup;
  selectedContact: Contact | null = null;

  constructor(private contactService: ContactService, private fb: FormBuilder , private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getContacts();

    this.editForm = this.fb.group({
      name: [''],
      email: [''],
      subject: [''],
    });
  }

  getContacts(): void {
    this.contactService.getAllContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  deleteContact(contact: Contact): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      this.contactService.deleteContact(contact.id!).subscribe(() => {
        this.contacts = this.contacts.filter(c => c.id !== contact.id);
      });
    }
  }

}
