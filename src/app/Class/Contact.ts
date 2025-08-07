export interface Contact {
 id?: number; // Ajouté !
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  consent: boolean;
}
