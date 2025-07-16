import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './paiement.html',
  styleUrl: './paiement.css'
})
export class Paiement implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  token = '';
  inscription = signal<any>(null);
  success = signal<boolean | null>(null); // ✅ null = pas encore traité

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.token = params['token'];
    const successParam = params['success'];


    if (this.token) {
      this.http.get(`http://192.168.1.54:8082/api/inscriptions/formation/by-token/${this.token}`)
        .subscribe({
          next: (res: any) => {
            this.inscription.set(res);
            console.log('ℹ️ Inscription chargée :', res);

            if (successParam === 'true') {
              console.log('✅ Redirection après paiement détectée → confirmation en cours...');
              this.confirmerPaiementViaToken(this.token);
            } else {
              console.log('ℹ️ Aucune redirection de paiement détectée (success ≠ true)');
            }
          },
          error: () => {
            alert('❌ Erreur lors du chargement de l’inscription');
            this.success.set(false);
          }
        });
    }
  });
}

  payer(): void {
    const inscription = this.inscription();
    if (!inscription) {
      alert('Inscription non chargée');
      return;
    }

    const inscriptionId = inscription.id;

    this.http.post<{ checkoutUrl: string }>(
      `http://192.168.1.54:8082/api/stripe/create-checkout-session/${inscriptionId}`, {}
    ).subscribe({
      next: (res) => {
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          alert('❌ URL Stripe non reçue');
        }
      },
      error: () => {
        alert('❌ Erreur lors de la création de la session Stripe');
      }
    });
  }

confirmerPaiementViaToken(token: string): void {
  console.log("📡 Envoi de la requête PATCH avec le token :", token);

  this.http.patch(`http://192.168.1.54:8082/api/inscriptions/formation/paiement/confirmer-token/${token}`, {})
    .subscribe({
      next: () => {
        console.log("✅ Paiement confirmé avec succès !");
        this.success.set(true);
      },
      error: (err) => {
        console.error("❌ Erreur lors de la confirmation du paiement :", err);
        this.success.set(false);

        // 🔔 Remplacer alert() par SnackBar si Angular Material est utilisé
        alert("❌ Une erreur est survenue lors de la confirmation du paiement.\nVeuillez réessayer ou contacter le support.");
      }
    });
}
}
