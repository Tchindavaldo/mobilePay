import { Injectable, OnDestroy } from '@angular/core';
import { Socket } from 'socket.io-client';
import { take } from 'rxjs/operators';
import { SocketService } from '../socket.service';
import { PlanActivationService } from '../../store/plan-activation/plan-activation.service';
import { UserStorageService } from '../../storage/user-storage.service';
import { PlanActivation } from '../../store/plan-activation/plan-activation-reducer';

@Injectable({
  providedIn: 'root'
})
export class ActivationSocketService implements OnDestroy {
  private socket!: Socket;
  private currentUserId: string = '';

  constructor(
    private socketService: SocketService,
    private planActivationService: PlanActivationService,
    private userStorage: UserStorageService
  ) {
    this.initializeSocket();
  }

  /**
   * Initialise le socket et configure les listeners
   */
  private async initializeSocket(): Promise<void> {
    // Récupérer l'ID utilisateur
    await this.initializeUser();

    // Obtenir l'instance socket
    this.socket = this.socketService.getSocket();

    if (this.socket) {
      this.setupSocketListeners();
      console.log('🔌 Socket d\'activation initialisé');
    } else {
      console.error('❌ Socket non disponible pour les activations');
    }
  }

  /**
   * Récupère l'ID utilisateur depuis le storage
   */
  private async initializeUser(): Promise<void> {
    try {
      const user = await this.userStorage.get('user');
      if (user && user.id) {
        this.currentUserId = user.id;
        console.log('🆔 User ID chargé pour les activations:', this.currentUserId);
      } else {
        console.error('❌ Aucun utilisateur trouvé dans le storage');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
    }
  }

  /**
   * Configure les listeners pour les événements socket
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Écouter les mises à jour d'activation
    this.socket.on('activationupdate', (data: any) => {
      console.log('📡 Mise à jour d\'activation reçue:', data);
      this.handleActivationUpdate(data);
    });

    // Écouter les nouvelles activations
    this.socket.on('activationcreated', (data: any) => {
      console.log('📡 Nouvelle activation reçue:', data);
      this.handleActivationCreated(data);
    });

    // Écouter les activations supprimées
    this.socket.on('activationdeleted', (data: any) => {
      console.log('📡 Activation supprimée reçue:', data);
      this.handleActivationDeleted(data);
    });

    // Écouter les changements de statut d'activation
    this.socket.on('activationstatuschanged', (data: any) => {
      console.log('📡 Changement de statut d\'activation reçu:', data);
      this.handleActivationStatusChanged(data);
    });

    // Écouter la validation du paiement
    this.socket.on('payment_validated', (data: any) => {
      console.log('📡 Paiement validé reçu:', data);
      this.handlePaymentValidated(data);
    });

    // Écouter le succès de l'abonnement
    this.socket.on('subscription_success', (data: any) => {
      console.log('📡 Abonnement réussi reçu:', data);
      this.handleSubscriptionSuccess(data);
    });

    // Écouter les erreurs d'abonnement
    this.socket.on('subscription_error', (data: any) => {
      console.log('📡 Erreur d\'abonnement reçue:', data);
      this.handleSubscriptionError(data);
    });

    console.log('👂 Listeners d\'activation configurés (7 événements)');
  }

  /**
   * Gère les mises à jour d'activation (seulement si la liste n'est pas null)
   */
  private async handleActivationUpdate(data: any): Promise<void> {
    if (!data || !data.data) {
      console.warn('⚠️ Données d\'activation invalides:', data);
      return;
    }

    const activation: PlanActivation = data.data;

    // Vérifier si l'activation appartient à l'utilisateur actuel
    if (activation.userId === this.currentUserId) {
      // Vérifier que la liste est initialisée avant de modifier
      const currentActivations = await this.planActivationService.getPlanActivations().pipe(
        take(1)
      ).toPromise();

      if (currentActivations === null) {
        console.warn('⚠️ Mise à jour d\'activation ignorée: liste non initialisée');
        return;
      }

      console.log('✅ Mise à jour de l\'activation pour l\'utilisateur actuel:', activation.id);

      // Mettre à jour l'activation dans le store
      this.planActivationService.updatePlanActivation(activation.id, activation);
    }
  }

  /**
   * Gère les nouvelles activations créées (seulement si la liste n'est pas null)
   */
  private async handleActivationCreated(data: any): Promise<void> {
    if (!data || !data.data) {
      console.warn('⚠️ Données de nouvelle activation invalides:', data);
      return;
    }

    const activation: PlanActivation = data.data;

    // Vérifier si l'activation appartient à l'utilisateur actuel
    if (activation.userId === this.currentUserId) {
      // Vérifier que la liste est initialisée avant d'ajouter
      const currentActivations = await this.planActivationService.getPlanActivations().pipe(
        take(1)
      ).toPromise();

      if (currentActivations === null) {
        console.warn('⚠️ Nouvelle activation ignorée: liste non initialisée');
        return;
      }

      console.log('✅ Nouvelle activation pour l\'utilisateur actuel:', activation.id);

      // Ajouter l'activation au store
      this.planActivationService.addPlanActivation(activation);
    }
  }

  /**
   * Gère les activations supprimées (seulement si la liste n'est pas null)
   */
  private async handleActivationDeleted(data: any): Promise<void> {
    if (!data || !data.activationId) {
      console.warn('⚠️ ID d\'activation supprimée invalide:', data);
      return;
    }

    const activationId: string = data.activationId;
    const userId: string = data.userId;

    // Vérifier si l'activation appartient à l'utilisateur actuel
    if (userId === this.currentUserId) {
      // Vérifier que la liste est initialisée avant de supprimer
      const currentActivations = await this.planActivationService.getPlanActivations().pipe(
        take(1)
      ).toPromise();

      if (currentActivations === null) {
        console.warn('⚠️ Suppression d\'activation ignorée: liste non initialisée');
        return;
      }

      console.log('✅ Suppression d\'activation pour l\'utilisateur actuel:', activationId);

      // Supprimer l'activation du store
      this.planActivationService.removePlanActivation(activationId);
    }
  }

  /**
   * Gère les changements de statut d'activation (seulement si la liste n'est pas null)
   */
  private async handleActivationStatusChanged(data: any): Promise<void> {
    if (!data || !data.data || !data.newStatus) {
      console.warn('⚠️ Données de changement de statut invalides:', data);
      return;
    }

    const activation = data.data;
    const activationId: string = activation.id;
    const newStatus: string = data.newStatus;
    const previousStatus: string = data.previousStatus;
    const userId: string = activation.userId;

    // Vérifier si l'activation appartient à l'utilisateur actuel
    if (userId === this.currentUserId) {
      // Vérifier que la liste est initialisée avant de modifier
      const currentActivations = await this.planActivationService.getPlanActivations().pipe(
        take(1)
      ).toPromise();

      if (currentActivations === null) {
        console.warn('⚠️ Changement de statut ignoré: liste non initialisée');
        return;
      }

      console.log(`✅ Changement de statut: ${previousStatus} → ${newStatus} pour:`, activationId);

      // Mettre à jour l'activation complète dans le store avec toutes les données reçues
      this.planActivationService.updatePlanActivation(activationId, {
        ...activation,
        status: newStatus as any,
        updatedAt: activation.dateModification || new Date().toISOString()
      });
    }
  }

  /**
   * Gère la validation du paiement
   */
  private async handlePaymentValidated(data: any): Promise<void> {
    if (!data || !data.data) {
      console.warn('⚠️ Données de paiement invalidées:', data);
      return;
    }

    const paymentData = data.data;
    const userId: string = paymentData.userId;
    const planActivationId: string = paymentData.planActivationId;

    // Vérifier si le paiement appartient à l'utilisateur actuel
    if (userId === this.currentUserId) {
      // Vérifier que la liste est initialisée avant de modifier
      const currentActivations = await this.planActivationService.getPlanActivations().pipe(
        take(1)
      ).toPromise();

      if (currentActivations === null) {
        console.warn('⚠️ Validation de paiement ignorée: liste non initialisée');
        return;
      }

      console.log('✅ Paiement validé pour l\'utilisateur actuel:', planActivationId);

      // Mettre à jour l'activation dans le store
      this.planActivationService.updatePlanActivation(planActivationId, {
        status: 'pending' as any, // Reste en pending jusqu'à l'activation Netflix
        updatedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Gère le succès de l'abonnement Netflix
   */
  private async handleSubscriptionSuccess(data: any): Promise<void> {
    if (!data || !data.data || !data.data.activation) {
      console.warn('⚠️ Données de succès d\'abonnement invalides:', data);
      return;
    }

    const activation: PlanActivation = data.data.activation;

    // Vérifier si l'activation appartient à l'utilisateur actuel
    if (activation.userId === this.currentUserId) {
      // Vérifier que la liste est initialisée avant de modifier
      const currentActivations = await this.planActivationService.getPlanActivations().pipe(
        take(1)
      ).toPromise();

      if (currentActivations === null) {
        console.warn('⚠️ Succès d\'abonnement ignoré: liste non initialisée');
        return;
      }

      console.log('✅ Abonnement Netflix activé avec succès pour:', activation.id);

      // Vérifier si l'activation existe déjà
      const existingActivation = currentActivations?.find(a => a.id === activation.id);

      if (existingActivation) {
        // Mettre à jour l'activation existante
        this.planActivationService.updatePlanActivation(activation.id, activation);
      } else {
        // Ajouter la nouvelle activation en haut de la liste
        this.planActivationService.addPlanActivation(activation);
      }
    }
  }

  /**
   * Gère les erreurs d'abonnement Netflix
   */
  private async handleSubscriptionError(data: any): Promise<void> {
    if (!data || !data.data) {
      console.warn('⚠️ Données d\'erreur d\'abonnement invalides:', data);
      return;
    }

    const errorData = data.data;
    const userId: string = errorData.userId;
    const planActivationId: string = errorData.planActivationId;
    const errorMessage: string = data.error || data.message;

    // Vérifier si l'erreur appartient à l'utilisateur actuel
    if (userId === this.currentUserId) {
      // Vérifier que la liste est initialisée avant de modifier
      const currentActivations = await this.planActivationService.getPlanActivations().pipe(
        take(1)
      ).toPromise();

      if (currentActivations === null) {
        console.warn('⚠️ Erreur d\'abonnement ignorée: liste non initialisée');
        return;
      }

      console.error('❌ Erreur d\'abonnement Netflix pour:', planActivationId, errorMessage);

      // Mettre à jour l'activation dans le store avec le statut d'échec
      this.planActivationService.updatePlanActivation(planActivationId, {
        status: 'cancelled' as any, // Marquer comme annulé en cas d'erreur
        updatedAt: new Date().toISOString()
      });

      // Optionnel: Définir une erreur dans le store
      this.planActivationService.setError(errorMessage);
    }
  }

  /**
   * Rejoindre une room spécifique pour les activations
   */
  public joinActivationRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('join_activation_room', userId);
      console.log('🏠 Rejoint la room d\'activation pour l\'utilisateur:', userId);
    }
  }

  /**
   * Quitter une room d'activation
   */
  public leaveActivationRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('leave_activation_room', userId);
      console.log('🚪 Quitté la room d\'activation pour l\'utilisateur:', userId);
    }
  }

  /**
   * Demander une synchronisation des activations
   */
  public requestActivationSync(): void {
    if (this.socket && this.currentUserId) {
      this.socket.emit('sync_activations', { userId: this.currentUserId });
      console.log('🔄 Synchronisation des activations demandée pour:', this.currentUserId);
    }
  }

  /**
   * Nettoyage lors de la destruction du service
   */
  ngOnDestroy(): void {
    if (this.socket) {
      // Supprimer tous les listeners d'activation
      this.socket.off('activationupdate');
      this.socket.off('activationcreated');
      this.socket.off('activationdeleted');
      this.socket.off('activationstatuschanged');

      // Quitter la room d'activation
      if (this.currentUserId) {
        this.leaveActivationRoom(this.currentUserId);
      }

      console.log('🧹 Service socket d\'activation nettoyé');
    }
  }
}
