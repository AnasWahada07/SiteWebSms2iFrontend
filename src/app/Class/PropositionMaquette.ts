export interface PropositionMaquette {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  description: string;
  fichierNom: string;
  fichierUrl?: string;
  dateSoumission: string;
}
