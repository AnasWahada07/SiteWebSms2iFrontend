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
import { Contact } from './Class/Contact';
import { Contacts } from './contact/contact';
import { Maquette } from './maquette/maquette';
import { ViewDemandeFormation } from './view-demande-formation/view-demande-formation';
import { ViewInscritFormation } from './view-inscrit-formation/view-inscrit-formation';
import { Viewcompetence } from './viewcompetence/viewcompetence';
import { AvisComponent } from './avis/avis';


export const routes: Routes = [
  { path: '', redirectTo: 'acceuil', pathMatch: 'full' }, 
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
  { path: 'maquettes', component: Maquette  },
  { path: 'viewformationinscrit', component: ViewInscritFormation },


     







  // 🔐 Routes protégées par adminGuard fonctionnel
  { path: 'gestionuser', component: User, canActivate: [adminGuard] },
  { path: 'viewprojet', component: ViewProjet, canActivate: [adminGuard] },
  { path: 'viewgalerie', component: ViewGalerie, canActivate: [adminGuard] },
  { path: 'viewformation', component: ViewFormation, canActivate: [adminGuard] },
  { path: 'viewinscription', component: ViewInscription, canActivate: [adminGuard] },
  { path: 'Admin', component: DashboardAdmin, canActivate: [adminGuard] },
    { path: 'contact', component: Contacts , canActivate: [adminGuard] },
        { path: 'viewdemandeformation', component: ViewDemandeFormation , canActivate: [adminGuard] },
            { path: 'competences', component: Viewcompetence , canActivate: [adminGuard] },
                  { path: 'avis', component: AvisComponent , canActivate: [adminGuard] }






];
