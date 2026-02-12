import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PaymentRequest, PaymentResponse, PlanType } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Initialise un paiement mobile money
   * @param paymentData - Données du paiement
   * @returns Observable avec la réponse de l'API
   */
  initiateMobileMoneyPayment(paymentData: PaymentRequest): Observable<PaymentResponse> {
    const endpoint = `${this.apiUrl}/api/payment/initpaiment`;

    return this.http.post<PaymentResponse>(endpoint, paymentData).pipe(
      map(response => {
        console.log('✅ Paiement initié avec succès:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Initialise un paiement mobile money (Nouveau Endpoint)
   * @param paymentData - Données du paiement
   * @returns Observable avec la réponse de l'API (transactionId, paymentLink)
   */
  initiateMobileMoneyPaymentNew(paymentData: any): Observable<any> {
    const endpoint = `${this.apiUrl}/api/payment/init-mobile-money`;

    return this.http.post<any>(endpoint, paymentData).pipe(
      map(response => {
        console.log('✅ Paiement Mobile Money initié:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Initialise le processus d'abonnement
   * @param subscriptionData - Données d'abonnement
   * @returns Observable avec la réponse
   */
  initSubscription(subscriptionData: any): Observable<any> {
    const endpoint = `${this.apiUrl}/api/subscription/init`;
    return this.http.post<any>(endpoint, subscriptionData).pipe(
      map(response => {
        console.log('✅ Abonnement initié:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Annuler la vérification d'un paiement en cours
   * @param transactionId - ID de la transaction à annuler
   */
  cancelPaymentVerification(transactionId: string): Observable<any> {
    const endpoint = `${this.apiUrl}/api/subscription/cancel`;
    return this.http.post<any>(endpoint, { transactionId }).pipe(
      map(response => {
        console.log('✅ Annulation demandée:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtient les informations d'un plan
   * @param planType - Type de plan
   * @returns Informations du plan
   */
  getPlanInfo(planType: PlanType): { price: number; name: string; resolution: string } {
    const plans = {
      mobile: { price: 3.99, name: 'Plan Mobile', resolution: '480p' },
      basic: { price: 4.99, name: 'Plan Essentiel', resolution: '720p HD' },
      standard: { price: 8.99, name: 'Plan Standard', resolution: '1080p Full HD' },
      premium: { price: 10.99, name: 'Plan Premium', resolution: '4K Ultra HD' }
    };

    return plans[planType] || plans.premium;
  }

  /**
   * Vérifie la validité d'un numéro de téléphone
   * @param phoneNumber - Numéro de téléphone
   * @returns true si valide
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Format: 6XX XXX XXX (9 chiffres sans préfixe) ou +237 6XX XXX XXX (12 chiffres avec préfixe)
    // Accepte aussi les numéros internationaux (10-15 chiffres)
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * Vérifie la validité d'un email
   * @param email - Adresse email
   * @returns true si valide
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Récupère ou crée des identifiants Netflix pour l'utilisateur
   * @param userId - ID de l'utilisateur
   * @param nom - Nom de l'utilisateur
   * @param prenom - Prénom de l'utilisateur
   * @returns Observable avec les identifiants (email, password)
   */
  getNetflixCredentials(userId: string, nom: string, prenom: string): Observable<any> {
    const endpoint = `${this.apiUrl}/api/netflix/credentials`;
    return this.http.post<any>(endpoint, { userId, nom, prenom }).pipe(
      map(response => {
        console.log('✅ Identifiants Netflix récupérés:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs HTTP
   * @param error - Erreur HTTP
   * @returns Observable avec l'erreur formatée
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors du paiement.';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      console.error('❌ Erreur client:', error.error.message);
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      console.error(`❌ Erreur serveur ${error.status}:`, error.error);
      errorMessage = error.error?.message || `Erreur ${error.status}: ${error.message}`;
    }

    return throwError(() => ({
      status: error.status,
      error: { message: errorMessage }
    }));
  }
}
