import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PlanActivation } from '../store/plan-activation/plan-activation-reducer';

@Injectable({
  providedIn: 'root'
})
export class PlanActivationApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les activations d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Observable avec la liste des activations
   */
  getUserActivations(userId: string): Observable<PlanActivation[]> {
    const endpoint = `${this.apiUrl}/api/plan-activation/user/${userId}`;
    
    return this.http.get<{ success: boolean; data: PlanActivation[] }>(endpoint).pipe(
      map(response => {
        console.log('✅ Activations récupérées avec succès:', response);
        return response.data || [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère une activation spécifique par ID
   * @param activationId - ID de l'activation
   * @returns Observable avec l'activation
   */
  getActivationById(activationId: string): Observable<PlanActivation> {
    const endpoint = `${this.apiUrl}/api/plan-activation/${activationId}`;
    
    return this.http.get<{ success: boolean; data: PlanActivation }>(endpoint).pipe(
      map(response => {
        console.log('✅ Activation récupérée avec succès:', response);
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Crée une nouvelle activation
   * @param activation - Données de l'activation à créer
   * @returns Observable avec l'activation créée
   */
  createActivation(activation: Partial<PlanActivation>): Observable<PlanActivation> {
    const endpoint = `${this.apiUrl}/api/plan-activation`;
    
    return this.http.post<{ success: boolean; data: PlanActivation }>(endpoint, activation).pipe(
      map(response => {
        console.log('✅ Activation créée avec succès:', response);
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour une activation existante
   * @param activationId - ID de l'activation
   * @param updates - Mises à jour à appliquer
   * @returns Observable avec l'activation mise à jour
   */
  updateActivation(activationId: string, updates: Partial<PlanActivation>): Observable<PlanActivation> {
    const endpoint = `${this.apiUrl}/api/plan-activation/${activationId}`;
    
    return this.http.put<{ success: boolean; data: PlanActivation }>(endpoint, updates).pipe(
      map(response => {
        console.log('✅ Activation mise à jour avec succès:', response);
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Supprime une activation
   * @param activationId - ID de l'activation à supprimer
   * @returns Observable avec la confirmation
   */
  deleteActivation(activationId: string): Observable<{ success: boolean; message: string }> {
    const endpoint = `${this.apiUrl}/api/plan-activation/${activationId}`;
    
    return this.http.delete<{ success: boolean; message: string }>(endpoint).pipe(
      map(response => {
        console.log('✅ Activation supprimée avec succès:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Active une activation en attente
   * @param activationId - ID de l'activation à activer
   * @returns Observable avec l'activation activée
   */
  activateActivation(activationId: string): Observable<PlanActivation> {
    const endpoint = `${this.apiUrl}/api/plan-activation/${activationId}/activate`;
    
    return this.http.post<{ success: boolean; data: PlanActivation }>(endpoint, {}).pipe(
      map(response => {
        console.log('✅ Activation activée avec succès:', response);
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Annule une activation
   * @param activationId - ID de l'activation à annuler
   * @returns Observable avec l'activation annulée
   */
  cancelActivation(activationId: string): Observable<PlanActivation> {
    const endpoint = `${this.apiUrl}/api/plan-activation/${activationId}/cancel`;
    
    return this.http.post<{ success: boolean; data: PlanActivation }>(endpoint, {}).pipe(
      map(response => {
        console.log('✅ Activation annulée avec succès:', response);
        return response.data;
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
    let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || `Erreur serveur: ${error.status} - ${error.message}`;
    }
    
    console.error('❌ Erreur API Plan Activation:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
