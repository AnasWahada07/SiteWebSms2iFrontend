export interface Formations {
  id?: number; 

  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  titre: string;

  formationType: string; 
  theme: string;
  description: string;
  participants: number; 
  proposerPrix?: number;

  statut?: string;

  duree: string;
  certificat: string;
  technologie: string;


}
