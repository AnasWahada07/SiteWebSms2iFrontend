import { Routes } from '@angular/router';
import { Accueil } from './accueil/accueil';
import { SignIn } from './sign-in/sign-in';
import { SignUp } from './sign-up/sign-up';
import { Galerie } from './galerie/galerie';
import { Service } from './service/service';
import { Formation } from './formation/formation';
import { DemandeFormation } from './demande-formation/demande-formation';
import { InscriptionFormation } from './inscription-formation/inscription-formation';
import { EspaceUniversitaire } from './espace-universitaire/espace-universitaire';
import { ResetPassword } from './reset-password/reset-password';

import { User } from './user/user';
import { ViewProjet } from './view-projet/view-projet';
import { ViewGalerie } from './view-galerie/view-galerie';
import { ViewFormation } from './view-formation/view-formation';
import { ViewInscription } from './view-inscription/view-inscription';
import { DashboardAdmin } from './dashboard-admin/dashboard-admin';

import { adminGuard } from './Services/Admin.guard'; 

export const routes: Routes = [
  { path: 'acceuil', component: Accueil },
  { path: 'signup', component: SignUp },
  { path: 'signin', component: SignIn },
  { path: 'galerie', component: Galerie },
  { path: 'service', component: Service },
  { path: 'formation', component: Formation },
  { path: 'demandeformation', component: DemandeFormation },
  { path: 'inscriptionformation', component: InscriptionFormation },
  { path: 'espaceuniversitaire', component: EspaceUniversitaire },
  { path: 'password', component: ResetPassword },

  // 🔐 Routes protégées par adminGuard fonctionnel
  { path: 'gestionuser', component: User, canActivate: [adminGuard] },
  { path: 'viewprojet', component: ViewProjet, canActivate: [adminGuard] },
  { path: 'viewgalerie', component: ViewGalerie, canActivate: [adminGuard] },
  { path: 'viewformation', component: ViewFormation, canActivate: [adminGuard] },
  { path: 'viewinscription', component: ViewInscription, canActivate: [adminGuard] },
  { path: 'Admin', component: DashboardAdmin, canActivate: [adminGuard] }
];
