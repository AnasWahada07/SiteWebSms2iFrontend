interface User {
  id: number;  // Changé de 'id?' à 'id' si toujours présent
  nom: string;
  prenom: string;
  telephone?: string;  // Optionnel
  email: string;
  organisme?: string;  // Optionnel
  adresse?: string;    // Optionnel
  role: string;
  password?: string;   // Optionnel
}
