import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { PlanActivationApiService } from '../api/plan-activation-api.service';
import { ActivationSocketService } from '../socket/activation/activation-socket.service';
import { PlanActivationService } from '../store/plan-activation/plan-activation.service';
import { UserStorageService } from '../storage/user-storage.service';
import { PlanActivation } from '../store/plan-activation/plan-activation-reducer';

@Injectable({
  providedIn: 'root'
})
export class ActivationManagerService implements OnDestroy {
  private currentUserId: string = '';
  private isInitialized = false;

  // Subject pour gérer l'état de chargement global
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Subject pour gérer les erreurs globales
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private apiService: PlanActivationApiService,
    private socketService: ActivationSocketService,
    private storeService: PlanActivationService,
    private userStorage: UserStorageService
  ) {
    this.initializeService();
  }

  /**
   * Initialise le service avec l'utilisateur actuel
   */
  private async initializeService(): Promise<void> {
    try {
      console.log('🔍 [DEBUG] Initialisation du service...');
      const user = await this.userStorage.get('user');
      console.log('🔍 [DEBUG] Utilisateur récupéré du storage:', user);
      
      if (user && user.id) {
        this.currentUserId = user.id;
        this.isInitialized = true;
        console.log('🚀 Service d\'activation initialisé pour l\'utilisateur:', this.currentUserId);
        
        // Rejoindre la room socket pour cet utilisateur
        this.socketService.joinActivationRoom(this.currentUserId);
      } else {
        console.error('❌ Aucun utilisateur trouvé dans le storage');
        throw new Error('Aucun utilisateur connecté');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du service d\'activation:', error);
      this.setError('Erreur lors de l\'initialisation du service d\'activation');
    }
  }

  /**
   * Charge toutes les activations de l'utilisateur depuis l'API
   * Affiche un loader et stocke les données dans le store
   */
  public loadUserActivations(): Observable<PlanActivation[]> {
    if (!this.isInitialized || !this.currentUserId) {
      return throwError(() => new Error('Service non initialisé ou utilisateur non connecté'));
    }

    // Activer le loader
    this.setLoading(true);
    this.clearError();

    console.log('📡 Chargement des activations pour l\'utilisateur:', this.currentUserId);

    return this.apiService.getUserActivations(this.currentUserId).pipe(
      catchError(error => {
        console.error('❌ Erreur lors du chargement des activations:', error);
        this.setError('Erreur lors du chargement des activations');
        return throwError(() => error);
      }),
      finalize(() => {
        // Désactiver le loader
        this.setLoading(false);
      })
    );
  }

  /**
   * Charge et stocke les activations dans le store seulement si la liste est null
   */
  public async loadAndStoreActivations(): Promise<void> {
    console.log('🔍 [DEBUG] loadAndStoreActivations appelée');
    console.log('🔍 [DEBUG] Service initialisé?', this.isInitialized);
    console.log('🔍 [DEBUG] User ID:', this.currentUserId);
    
    // Vérifier d'abord si les activations sont déjà chargées
    const currentActivations = await this.storeService.getPlanActivations().pipe(
      take(1)
    ).toPromise();
    
    console.log('🔍 [DEBUG] Activations actuelles dans le store:', currentActivations);
    
    // Ne charger que si la liste est null (pas encore initialisée)
    if (currentActivations !== null) {
      console.log('ℹ️ Activations déjà chargées, pas de rechargement nécessaire');
      console.log('ℹ️ Nombre d\'activations:', currentActivations?.length || 0);
      return;
    }
    
    try {
      console.log('🔄 Chargement initial des activations depuis l\'API...');
      const activations = await this.loadUserActivations().toPromise();
      
      if (activations) {
        // Stocker les activations dans le store NgRx
        this.storeService.initPlanActivations(activations);
        console.log('✅ Activations stockées dans le store:', activations.length, 'activations');
      } else {
        // Même si pas d'activations, initialiser avec un tableau vide pour éviter de refaire l'appel
        this.storeService.initPlanActivations([]);
        console.log('✅ Aucune activation trouvée, store initialisé avec tableau vide');
      }
    } catch (error) {
      console.error('❌ Erreur lors du stockage des activations:', error);
      // En cas d'erreur, initialiser avec tableau vide pour éviter les appels répétés
      this.storeService.initPlanActivations([]);
      throw error;
    }
  }

  /**
   * Crée une nouvelle activation (seulement si la liste n'est pas null)
   */
  public async createActivation(activationData: Partial<PlanActivation>): Promise<PlanActivation> {
    if (!this.isInitialized || !this.currentUserId) {
      throw new Error('Service non initialisé ou utilisateur non connecté');
    }

    // Vérifier que la liste est initialisée avant d'ajouter
    const currentActivations = await this.storeService.getPlanActivations().pipe(
      take(1)
    ).toPromise();
    
    if (currentActivations === null) {
      console.warn('⚠️ Impossible de créer une activation: liste non initialisée');
      throw new Error('Liste des activations non initialisée');
    }

    this.setLoading(true);
    this.clearError();

    try {
      // Ajouter l'ID utilisateur aux données
      const dataWithUserId = {
        ...activationData,
        userId: this.currentUserId
      };

      const newActivation = await this.apiService.createActivation(dataWithUserId).toPromise();
      
      if (newActivation) {
        // Ajouter au store (le socket se chargera aussi de la mise à jour)
        this.storeService.addPlanActivation(newActivation);
        console.log('✅ Nouvelle activation créée et ajoutée au store:', newActivation.id);
        return newActivation;
      }
      
      throw new Error('Erreur lors de la création de l\'activation');
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'activation:', error);
      this.setError('Erreur lors de la création de l\'activation');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Met à jour une activation existante (seulement si la liste n'est pas null)
   */
  public async updateActivation(activationId: string, updates: Partial<PlanActivation>): Promise<PlanActivation> {
    // Vérifier que la liste est initialisée avant de modifier
    const currentActivations = await this.storeService.getPlanActivations().pipe(
      take(1)
    ).toPromise();
    
    if (currentActivations === null) {
      console.warn('⚠️ Impossible de mettre à jour une activation: liste non initialisée');
      throw new Error('Liste des activations non initialisée');
    }

    this.setLoading(true);
    this.clearError();

    try {
      const updatedActivation = await this.apiService.updateActivation(activationId, updates).toPromise();
      
      if (updatedActivation) {
        // Mettre à jour dans le store (le socket se chargera aussi de la mise à jour)
        this.storeService.updatePlanActivation(activationId, updatedActivation);
        console.log('✅ Activation mise à jour dans le store:', activationId);
        return updatedActivation;
      }
      
      throw new Error('Erreur lors de la mise à jour de l\'activation');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'activation:', error);
      this.setError('Erreur lors de la mise à jour de l\'activation');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Supprime une activation (seulement si la liste n'est pas null)
   */
  public async deleteActivation(activationId: string): Promise<void> {
    // Vérifier que la liste est initialisée avant de supprimer
    const currentActivations = await this.storeService.getPlanActivations().pipe(
      take(1)
    ).toPromise();
    
    if (currentActivations === null) {
      console.warn('⚠️ Impossible de supprimer une activation: liste non initialisée');
      throw new Error('Liste des activations non initialisée');
    }

    this.setLoading(true);
    this.clearError();

    try {
      await this.apiService.deleteActivation(activationId).toPromise();
      
      // Supprimer du store (le socket se chargera aussi de la mise à jour)
      this.storeService.removePlanActivation(activationId);
      console.log('✅ Activation supprimée du store:', activationId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'activation:', error);
      this.setError('Erreur lors de la suppression de l\'activation');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Active une activation en attente
   */
  public async activateActivation(activationId: string): Promise<PlanActivation> {
    const result = await this.apiService.activateActivation(activationId).toPromise();
    if (!result) {
      throw new Error('Erreur lors de l\'activation');
    }
    return result;
  }

  /**
   * Annule une activation
   */
  public async cancelActivation(activationId: string): Promise<PlanActivation> {
    const result = await this.apiService.cancelActivation(activationId).toPromise();
    if (!result) {
      throw new Error('Erreur lors de l\'annulation');
    }
    return result;
  }

  /**
   * Synchronise les activations avec le serveur
   */
  public syncActivations(): void {
    this.socketService.requestActivationSync();
  }

  /**
   * Accès direct au store pour les observables
   */
  public getActivationsFromStore(): Observable<PlanActivation[] | null> {
    return this.storeService.getPlanActivations();
  }

  public getActivationsByStatus(status: 'pending' | 'active' | 'expired' | 'cancelled'): Observable<PlanActivation[]> {
    return this.storeService.getPlanActivationsByStatus(status);
  }

  public getActivationById(id: string): Observable<PlanActivation | undefined> {
    return this.storeService.getPlanActivationById(id);
  }

  /**
   * Méthodes utilitaires pour gérer l'état
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.storeService.setLoading(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
    this.storeService.setError(error);
  }

  private clearError(): void {
    this.setError(null);
  }

  /**
   * Nettoyage lors de la destruction
   */
  ngOnDestroy(): void {
    if (this.currentUserId) {
      this.socketService.leaveActivationRoom(this.currentUserId);
    }
    this.loadingSubject.complete();
    this.errorSubject.complete();
    console.log('🧹 Service d\'activation nettoyé');
  }
}
