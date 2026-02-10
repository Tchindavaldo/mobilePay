import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { ActivationManagerService } from '../services/activation/activation-manager.service';
import { PlanActivation } from '../services/store/plan-activation/plan-activation-reducer';
import { LanguageService } from '../services/language.service';

interface Activation {
  id: string;
  plan: string;
  email: string;
  date: string;
  amount: string;
  status: 'activated' | 'pending' | 'expired';
  estimatedTime?: string;
  startDate?: string;   // Date de début pour les plans actifs
  expiryDate?: string;  // Date d'expiration pour les plans actifs
}

@Component({
  selector: 'app-activations',
  templateUrl: './activations.page.html',
  styleUrls: ['./activations.page.scss'],
})
export class ActivationsPage implements OnInit, OnDestroy {

  notificationCount: number = 0;
  searchTerm: string = '';
  activations: Activation[] = [];
  filteredActivations: Activation[] = [];
  isLoading: boolean = false;
  selectedActivationId: string | null = null; // ID de l'activation sélectionnée
  selectedPassword: string = ''; // Mot de passe à afficher
  private subscriptions: Subscription[] = [];

  constructor(
    private activationManager: ActivationManagerService,
    private alertController: AlertController,
    public langService: LanguageService
  ) { }

  t(key: string): string {
    return this.langService.translate(key);
  }

  async ngOnInit() {
    console.log('🚀 Initialisation de la page activations avec NgRx');

    // Charger les activations depuis l'API
    await this.loadActivations();

    // S'abonner aux changements du store
    const activationsSub = this.activationManager.getActivationsFromStore()
      .pipe(
        map(planActivations => this.convertToActivations(planActivations))
      )
      .subscribe(activations => {
        this.activations = activations;
        this.filterActivations();
        console.log('✅ Activations chargées:', activations.length);
      });

    this.subscriptions.push(activationsSub);
  }

  /**
   * Ajoute un plan actif par défaut pour visualiser le design
   */
  private addDefaultActivePlan(): void {
    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(expiry.getDate() + 30);

    const defaultActivePlan: Activation = {
      id: 'default-active-1',
      plan: 'Netflix Premium',
      email: 'demo@moobilpay.com',
      date: this.formatDate(today.toISOString()),
      amount: '6500 XAF',
      status: 'activated',
      startDate: this.formatDate(today.toISOString()),
      expiryDate: this.formatDate(expiry.toISOString())
    };

    this.activations = [defaultActivePlan];
  }

  /**
   * Charge les activations depuis l'API via le service NgRx
   */
  async loadActivations(): Promise<void> {
    try {
      this.isLoading = true;
      console.log('📊 Chargement des activations depuis l\'API...');
      await this.activationManager.loadAndStoreActivations();
      console.log('✅ Activations chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Convertit les PlanActivation du store en format Activation pour le template
   */
  private convertToActivations(planActivations: PlanActivation[] | null): Activation[] {
    if (!planActivations) {
      return [];
    }

    return planActivations.map(pa => {
      // Récupérer les valeurs avec les vrais noms de champs de l'API
      const planType = pa['planNetflix'] || pa.planType || pa['planName'];
      const email = pa['email'] || pa['userEmail'] || pa['netflixEmail'];
      const dateCreation = pa['dateCreation'] || pa.activationDate || pa.createdAt;
      const statut = pa['statut'] || pa.status;
      const amount = pa['amount'];
      const dureeActivation = pa['dureeActivation'] || 30; // Durée en jours (défaut 30)

      // Calculer les dates pour les plans actifs
      let startDate: string | undefined;
      let expiryDate: string | undefined;

      if (statut === 'activated' || statut === 'actif') {
        const activationDate = dateCreation ? new Date(dateCreation) : new Date();
        startDate = this.formatDate(activationDate.toISOString());

        // Calculer la date d'expiration
        const expiry = new Date(activationDate);
        expiry.setDate(expiry.getDate() + dureeActivation);
        expiryDate = this.formatDate(expiry.toISOString());
      }

      // Déterminer le statut correct
      let mappedStatus: 'activated' | 'pending' | 'expired' = 'pending';
      if (statut === 'activated' || statut === 'actif') {
        mappedStatus = 'activated';
      } else if (statut === 'expired' || statut === 'expiré' || statut === 'expire') {
        mappedStatus = 'expired';
      } else if (statut === 'pending' || statut === 'en_attente') {
        mappedStatus = 'pending';
      }

      return {
        id: pa.id,
        plan: this.getPlanDisplayName(planType),
        email: email || '...',
        date: dateCreation ? this.formatDate(dateCreation) : '...',
        amount: amount ? `${amount} XAF` : (planType ? this.calculateAmount(planType) : '...'),
        status: mappedStatus,
        estimatedTime: (mappedStatus === 'pending') ? '15-45 min' : undefined,
        startDate,
        expiryDate
      };
    });
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /**
   * Obtient le nom d'affichage du plan
   */
  private getPlanDisplayName(planType: string | undefined): string {
    if (!planType) return '...';

    const planNames: { [key: string]: string } = {
      'mobile': 'Netflix Mobile',
      'basic': 'Netflix Basic',
      'standard': 'Netflix Standard',
      'premium': 'Netflix Premium'
    };

    return planNames[planType.toLowerCase()] || planType;
  }

  /**
   * Calcule le montant selon le type de plan
   */
  private calculateAmount(planType: string | undefined): string {
    if (!planType) return '...';

    const amounts: { [key: string]: string } = {
      'mobile': '2500 XAF',
      'basic': '3000 XAF',
      'standard': '5500 XAF',
      'premium': '6500 XAF'
    };
    return amounts[planType.toLowerCase()] || '...';
  }

  /**
   * Méthode pour afficher les anciennes données de test (non utilisée)
   */
  loadActivationsOld() {
    // Anciennes données de démonstration (conservées pour référence)
    this.activations = [
      {
        id: '1',
        plan: 'Netflix Premium',
        email: 'user@example.com',
        date: '10 Oct 2025',
        amount: '6500 XAF',
        status: 'activated'
      },
      {
        id: '2',
        plan: 'Netflix Standard',
        email: 'user2@example.com',
        date: '09 Oct 2025',
        amount: '5500 XAF',
        status: 'pending',
        estimatedTime: '15-45 min'
      },
      {
        id: '3',
        plan: 'Netflix Basic',
        email: 'user3@example.com',
        date: '08 Oct 2025',
        amount: '3000 XAF',
        status: 'activated'
      },
      {
        id: '4',
        plan: 'Netflix Premium',
        email: 'user4@example.com',
        date: '07 Oct 2025',
        amount: '13,99€',
        status: 'pending',
        estimatedTime: '30-60 min'
      }
    ];

    this.filteredActivations = [...this.activations];
  }

  filterActivations() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredActivations = [...this.activations];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredActivations = this.activations.filter(activation =>
      activation.plan.toLowerCase().includes(term) ||
      activation.email.toLowerCase().includes(term) ||
      activation.date.toLowerCase().includes(term)
    );
  }

  getTotalActivations(): number {
    return this.activations.length;
  }

  getActiveCount(): number {
    return this.activations.filter(a => a.status === 'activated').length;
  }

  getPendingCount(): number {
    return this.activations.filter(a => a.status === 'pending').length;
  }

  getExpiredCount(): number {
    return this.activations.filter(a => a.status === 'expired').length;
  }

  getTotalSpent(): number {
    // Calculer le total dépensé en extrayant les montants (sans décimales)
    const total = this.activations.reduce((total, activation) => {
      const amount = parseFloat(activation.amount.replace('XAF', '').replace(/\s/g, ''));
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
    return Math.round(total); // Arrondir pour éliminer les décimales
  }

  async viewActivationDetails(activation: Activation) {
    console.log('Détails activation:', activation);
    
    // Si on clique sur la même activation, toggle (cacher/afficher)
    if (this.selectedActivationId === activation.id) {
      this.selectedActivationId = null;
      this.selectedPassword = '';
      return;
    }
    
    // Récupérer l'activation complète depuis le store pour avoir le mot de passe
    const fullActivations = await this.activationManager.getActivationsFromStore().pipe(
      take(1)
    ).toPromise();
    
    const fullActivation = (fullActivations as PlanActivation[] | null)?.find((a: PlanActivation) => a.id === activation.id);
    
    if (fullActivation) {
      // Afficher le mot de passe Netflix dans les logs
      const netflixPassword = fullActivation['motDePasse'] || fullActivation['netflixPassword'] || fullActivation['password'];
      const netflixEmail = fullActivation['email'] || fullActivation['netflixEmail'];
      
      console.log('🔑 Mot de passe Netflix:', netflixPassword);
      console.log('📧 Email Netflix:', netflixEmail);
      console.log('📊 Données complètes:', fullActivation);
      
      // Afficher le mot de passe dans la liste
      this.selectedActivationId = activation.id;
      this.selectedPassword = netflixPassword || 'Non disponible';
    }
  }

  /**
   * Nettoyage lors de la destruction du composant
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log('🧹 Nettoyage des subscriptions');
  }
}
