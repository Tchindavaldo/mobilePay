import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../indx';
import {
  PlanActivation,
  PlanActivationState,
  initPlanActivationsReducer,
  addPlanActivationReducer,
  updatePlanActivationReducer,
  removePlanActivationReducer,
  setPlanActivationLoadingReducer,
  setPlanActivationErrorReducer
} from './plan-activation-reducer';

@Injectable({
  providedIn: 'root'
})
export class PlanActivationService {

  constructor(private store: Store<AppState>) { }

  // Sélecteurs pour accéder aux données du store
  getPlanActivations(): Observable<PlanActivation[] | null> {
    return this.store.select(state => state.planActivation.planActivations);
  }

  getLoading(): Observable<boolean> {
    return this.store.select(state => state.planActivation.loading);
  }

  getError(): Observable<string | null> {
    return this.store.select(state => state.planActivation.error);
  }

  // Sélecteur pour obtenir une activation spécifique par ID
  getPlanActivationById(id: string): Observable<PlanActivation | undefined> {
    return this.store.select(state =>
      state.planActivation.planActivations?.find((activation: PlanActivation) => activation.id === id)
    );
  }

  // Sélecteur pour obtenir les activations d'un utilisateur spécifique
  getPlanActivationsByUserId(userId: string): Observable<PlanActivation[]> {
    return this.store.select(state =>
      state.planActivation.planActivations?.filter((activation: PlanActivation) => activation.userId === userId) || []
    );
  }

  // Sélecteur pour obtenir les activations par statut
  getPlanActivationsByStatus(status: 'pending' | 'active' | 'expired' | 'cancelled'): Observable<PlanActivation[]> {
    return this.store.select(state =>
      state.planActivation.planActivations?.filter((activation: PlanActivation) => activation.status === status) || []
    );
  }

  // Actions pour modifier le store

  // Initialiser la liste des activations
  initPlanActivations(planActivations: PlanActivation[] | null): void {
    this.store.dispatch(initPlanActivationsReducer({ planActivations }));
  }

  // Ajouter une nouvelle activation
  addPlanActivation(planActivation: PlanActivation): void {
    this.store.dispatch(addPlanActivationReducer({ planActivation }));
  }

  // Mettre à jour une activation existante
  updatePlanActivation(id: string, updates: Partial<PlanActivation>): void {
    this.store.dispatch(updatePlanActivationReducer({ id, updates }));
  }

  // Supprimer une activation
  removePlanActivation(id: string): void {
    this.store.dispatch(removePlanActivationReducer({ id }));
  }

  // Gérer le loading
  setLoading(loading: boolean): void {
    this.store.dispatch(setPlanActivationLoadingReducer({ loading }));
  }

  // Gérer les erreurs
  setError(error: string | null): void {
    this.store.dispatch(setPlanActivationErrorReducer({ error }));
  }

  // Méthodes utilitaires

  // Créer une nouvelle activation avec des valeurs par défaut
  createPlanActivation(
    userId: string,
    planType: string,
    netflixEmail?: string,
    paymentId?: string
  ): PlanActivation {
    const now = new Date().toISOString();
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 mois par défaut

    return {
      id: this.generateId(),
      userId,
      planType,
      status: 'pending',
      activationDate: now,
      expirationDate: expirationDate.toISOString(),
      paymentId,
      netflixEmail,
      createdAt: now,
      updatedAt: now
    };
  }

  // Activer une activation en attente
  activatePlanActivation(id: string): void {
    const now = new Date().toISOString();
    this.updatePlanActivation(id, {
      status: 'active',
      activationDate: now,
      updatedAt: now
    });
  }

  // Expirer une activation
  expirePlanActivation(id: string): void {
    const now = new Date().toISOString();
    this.updatePlanActivation(id, {
      status: 'expired',
      updatedAt: now
    });
  }

  // Annuler une activation
  cancelPlanActivation(id: string): void {
    const now = new Date().toISOString();
    this.updatePlanActivation(id, {
      status: 'cancelled',
      updatedAt: now
    });
  }

  // Générer un ID unique
  private generateId(): string {
    return 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Vérifier si une activation est expirée
  isActivationExpired(activation: PlanActivation): boolean {
    return new Date(activation.expirationDate) < new Date();
  }

  // Obtenir le nombre de jours restants
  getDaysRemaining(activation: PlanActivation): number {
    const now = new Date();
    const expiration = new Date(activation.expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}
