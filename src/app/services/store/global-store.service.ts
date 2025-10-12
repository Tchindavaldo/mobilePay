import { Injectable } from '@angular/core';
import { PlanActivationService } from './plan-activation/plan-activation.service';
import { BonusService } from './bonus/bonus.service';
import { TransactionService } from './transaction/transaction.service';
import { NotificationStoreService } from './notification/notification.service';

/**
 * Service global pour accéder facilement à tous les stores NgRx
 * Permet d'utiliser tous les stores depuis n'importe quel composant
 * en injectant simplement ce service unique
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalStoreService {

  constructor(
    public planActivation: PlanActivationService,
    public bonus: BonusService,
    public transaction: TransactionService,
    public notification: NotificationStoreService
  ) {}

  // Méthodes utilitaires pour accéder rapidement aux stores

  /**
   * Accès rapide au store des activations de plans
   * Usage: globalStore.plans.getPlanActivations()
   */
  get plans() {
    return this.planActivation;
  }

  /**
   * Accès rapide au store des bonus
   * Usage: globalStore.bonuses.getBonus()
   */
  get bonuses() {
    return this.bonus;
  }

  /**
   * Accès rapide au store des transactions
   * Usage: globalStore.transactions.getTransactions()
   */
  get transactions() {
    return this.transaction;
  }

  /**
   * Accès rapide au store des notifications
   * Usage: globalStore.notifications.getNotifications()
   */
  get notifications() {
    return this.notification;
  }

  // Méthodes de convenance pour les opérations communes

  /**
   * Initialise tous les stores avec des données vides
   */
  initializeAllStores(): void {
    this.planActivation.initPlanActivations([]);
    this.bonus.setBonus([]);
    this.transaction.initTransactions([]);
    this.transaction.initTotalAmount(0);
  }

  /**
   * Efface toutes les données des stores
   */
  clearAllStores(): void {
    this.planActivation.initPlanActivations(null);
    this.bonus.setBonus(null);
    this.transaction.initTransactions(null);
    this.transaction.initTotalAmount(0);
  }

  /**
   * Active le mode loading pour tous les stores qui le supportent
   */
  setGlobalLoading(loading: boolean): void {
    this.planActivation.setLoading(loading);
    // Ajouter d'autres stores qui supportent le loading
  }

  /**
   * Efface toutes les erreurs des stores
   */
  clearAllErrors(): void {
    this.planActivation.setError(null);
    // Ajouter d'autres stores qui supportent les erreurs
  }
}

/**
 * Interface pour faciliter l'injection du service dans les composants
 * Usage dans un composant:
 * 
 * constructor(private store: GlobalStoreService) {}
 * 
 * ngOnInit() {
 *   // Accéder aux activations de plans
 *   this.store.plans.getPlanActivations().subscribe(activations => {
 *     console.log('Activations:', activations);
 *   });
 * 
 *   // Accéder aux bonus
 *   this.store.bonuses.getBonus().subscribe(bonus => {
 *     console.log('Bonus:', bonus);
 *   });
 * 
 *   // Accéder aux transactions
 *   this.store.transactions.getTransactions().subscribe(transactions => {
 *     console.log('Transactions:', transactions);
 *   });
 * 
 *   // Ajouter une nouvelle activation
 *   const newActivation = this.store.plans.createPlanActivation(
 *     'user123', 
 *     'premium', 
 *     'user@example.com'
 *   );
 *   this.store.plans.addPlanActivation(newActivation);
 * }
 */
