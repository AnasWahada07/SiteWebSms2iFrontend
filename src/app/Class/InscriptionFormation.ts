import { Formations } from "./Formations";

export interface InscriptionFormation {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  formation: Formations;
}
