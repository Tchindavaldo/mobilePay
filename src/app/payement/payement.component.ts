import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastController, AlertController, AnimationController } from '@ionic/angular';
import { CountdownService } from '../countdown.service';
import { PlanService } from '../plan.service';
import { NotificationService, Notification } from '../notification.service';
import { ApiService } from '../services/api.service';
import { PaymentService } from '../services/payment.service';
import { PaymentRequest, PlanType } from '../models';
import { Socket } from 'socket.io-client';
import { UserStorageService } from '../services/storage/user-storage.service';
import { SocketService } from '../services/socket/socket.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

type PaymentMethod = 'card' | 'paypal' | 'orangemoney' | 'mtnmoney';

@Component({
       selector: 'app-payement',
       templateUrl: './payement.component.html',
       styleUrls: ['./payement.component.scss'],
})
export class PayementComponent implements OnInit, OnDestroy {
       // Stepper state
       page: number = 1;          // Plan selection step (keep original)
       activeStep: number = 1;    // Payment stepper (1-4 from PaymentScreen.tsx)
       cardStep: number = 1;      // Card form sub-steps (1-2)

       // Loading and animation states
       isLoading: boolean = false;
       showCodePopup: boolean = false;
       paymentSuccess: boolean = false;
       fadeAnim: any;
       spinAnim: any;
       buffer: number = 0.06;
       progress: number = 0;
       verificationStep: number = 0; // 0 = not started, 1 = verifying, 2 = confirmed

       // Modal state
       showPaymentModal: boolean = false;
       paymentUrl: SafeResourceUrl | null = null;
       paymentFrameLoaded: boolean = false;

       // Plan selection data
       selectedPlan: string = 'premium'; // Default to premium plan
       showPlanDetails: boolean = false;

       // Payment data
       selectedPaymentMethod: PaymentMethod = 'card';
       cardNumber: string = '';
       cardName: string = '';
       expiryDate: string = '';
       cvv: string = '';
       saveCard: boolean = false;
       phoneNumber: string = '';
       phoneNumberError: string = '';
       phoneNumberValid: boolean = false;
       orderNumber: string = '';
       totalAmount: number = 0; // Will be initialized in ngOnInit
       netflixEmail: string = '';
       netflixPassword: string = '';

       // Socket and user management
       private socket!: Socket;
       private socketSubscription?: Subscription;
       private currentUserId: string = '';
       private subscriptionRequest?: Subscription; // Store subscription to cancel if needed
       private currentTransactionId: string = ''; // Store current transaction ID for cancellation
       isCancelling: boolean = false; // Flag for cancellation loading state

       // Handle modal dismissal (backdrop click or swipe down)
       canDismiss = async (data?: any, role?: string) => {
              // If it's a backdrop click or gesture (swipe), and we're not already cancelling
              if ((role === 'backdrop' || role === 'gesture') && !this.isCancelling) {
                     this.closePaymentModal();
                     return false; // Prevent immediate dismissal to show loader
              }
              // Allow dismissal if we are already in the final stage or it's a manual close that we've handled
              return true;
       };

       // Expose environment plans to template
       get plans() {
              return environment.plans;
       }

       // Get specific plan details
       getPlanDetails(planKey: string) {
              return environment.plans[planKey as keyof typeof environment.plans];
       }

       // Get currency for selected plan
       getCurrency(): string {
              const planConfig = environment.plans[this.selectedPlan as keyof typeof environment.plans];
              return planConfig ? planConfig.currency : environment.plans.premium.currency;
       }

       constructor(
              public router: Router,
              private planService: PlanService,
              private apiService: ApiService,
              private toastController: ToastController,
              private alertController: AlertController,
              private countdownService: CountdownService,
              private notificationService: NotificationService,
              private animationCtrl: AnimationController,
              private paymentService: PaymentService,
              private userStorage: UserStorageService,
              private socketService: SocketService,
              private sanitizer: DomSanitizer
       ) {
              // Initialize animations
              this.initializeAnimations();
       }


       async ngOnInit() {
              // Initialize totalAmount from environment (must be done here to ensure environment is loaded)
              this.totalAmount = environment.plans.premium.price;

              // Réinitialiser tous les états du stepper pour toujours commencer au step 1
              this.activeStep = 0;  // Reset au step 1 (choix du plan)
              this.page = 1;         // Reset à la première page
              this.verificationStep = 0;  // Reset verification

              // Reset des états de paiement
              this.isLoading = false;
              this.paymentSuccess = false;
              this.showCodePopup = false;
              this.paymentFrameLoaded = false;
              this.isCancelling = false;

              // Reset des champs de formulaire
              this.phoneNumber = '';
              this.cardNumber = '';
              this.expiryDate = '';
              this.cvv = '';
              this.netflixEmail = '';
              this.netflixPassword = '';

              // Initialize user and socket
              await this.initializeUser();
              this.initializeSocket();

              // Utiliser setTimeout pour s'assurer que les éléments sont chargés
              setTimeout(() => {
                     this.initializePlanSelection();
              }, 100);
       }

       ngOnDestroy() {
              // Clean up socket subscription
              if (this.socketSubscription) {
                     this.socketSubscription.unsubscribe();
              }

              // Remove socket listeners
              if (this.socket) {
                     this.socket.off('payment_validated');
              }
       }

       // Initialize animations (from PaymentScreen.tsx)
       initializeAnimations() {
              // Animation setup would be handled in Angular/Ionic way
              // For now, we'll use simple state management
       }

       // Format card number with spaces (from PaymentScreen.tsx)
       formatCardNumber(text: string): string {
              const cleaned = text.replace(/\s+/g, '');
              const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
              return formatted;
       }

       // Handle card number input (from PaymentScreen.tsx)
       handleCardNumberChange(text: string | null | undefined) {
              if (!text) return;
              const numericOnly = text.replace(/[^0-9]/g, '');
              const truncated = numericOnly.slice(0, 16);
              this.cardNumber = this.formatCardNumber(truncated);
       }

       // Handle expiry date input (from PaymentScreen.tsx)
       handleExpiryDateChange(text: string | null | undefined) {
              if (!text) return;
              const numericOnly = text.replace(/[^0-9]/g, '');
              if (numericOnly.length <= 2) {
                     this.expiryDate = numericOnly;
              } else {
                     this.expiryDate = `${numericOnly.slice(0, 2)}/${numericOnly.slice(2, 4)}`;
              }
       }

       // Handle CVV input (from PaymentScreen.tsx)
       handleCvvChange(text: string | null | undefined) {
              if (!text) return;
              const numericOnly = text.replace(/[^0-9]/g, '');
              this.cvv = numericOnly.slice(0, 4);
       }

       // Payment method selection (from PaymentScreen.tsx)
       selectPaymentMethodNew(method: PaymentMethod) {
              this.selectedPaymentMethod = method;
       }

       // Format phone number with default prefix from environment
       getFullPhoneNumber(): string {
              let cleanNumber = this.phoneNumber.trim();

              // Enlever le préfixe +237 si l'utilisateur l'a tapé manuellement
              if (cleanNumber.startsWith('+237')) {
                     cleanNumber = cleanNumber.substring(4); // Enlever "+237"
              } else if (cleanNumber.startsWith('237')) {
                     cleanNumber = cleanNumber.substring(3); // Enlever "237"
              } else if (cleanNumber.startsWith('+')) {
                     cleanNumber = cleanNumber.substring(1); // Enlever le "+" seul
              }

              // Ajouter le préfixe par défaut de l'environnement
              return `${environment.defaultPhonePrefix}${cleanNumber}`;
       }

       // Mobile money payment processing (from PaymentScreen.tsx)
       processMobileMoneyPayment() {
              // Validation des champs avec le service
              // Vérifier que le numéro n'est pas vide et a au moins 9 chiffres (format camerounais)
              const cleanPhone = this.phoneNumber.replace(/\s/g, '').replace(/\+/g, '').replace(/237/g, '');
              if (!this.phoneNumber || cleanPhone.length < 9 || !this.paymentService.validatePhoneNumber(this.phoneNumber)) {
                     this.presentErrorToast('Veuillez entrer un numéro de téléphone valide (9 chiffres)');
                     return;
              }

              if (!this.netflixEmail || !this.paymentService.validateEmail(this.netflixEmail)) {
                     this.presentErrorToast('Veuillez entrer un email Netflix valide');
                     return;
              }

              if (!this.netflixPassword) {
                     this.presentErrorToast('Veuillez entrer votre mot de passe Netflix');
                     return;
              }

              // Afficher le loader
              this.isLoading = true;

              // Préparer les données de paiement avec typage fort
              const paymentData: PaymentRequest = {
                     numeroOM: this.getFullPhoneNumber(), // Utilise le préfixe +237 de l'environnement
                     email: this.netflixEmail.trim(),
                     motDePasse: this.netflixPassword,
                     typeDePlan: this.selectedPlan as PlanType,
                     userId: this.currentUserId, // Include user ID from storage
                     amount: this.totalAmount // Montant du paiement
              };

              // 🔑 LOG DU MOT DE PASSE ET DES DONNÉES
              console.log('🔑 Mot de passe Netflix:', this.netflixPassword);
              console.log('📧 Email Netflix:', this.netflixEmail);
              console.log('📱 Numéro de téléphone complet:', this.getFullPhoneNumber());
              console.log('💳 Montant:', this.totalAmount, this.getCurrency());
              console.log('📦 Plan sélectionné:', this.selectedPlan);
              console.log('📊 Données complètes de paiement:', paymentData);

              // Appel API via le service
              this.paymentService.initiateMobileMoneyPayment(paymentData)
                     .subscribe({
                            next: (response: any) => {
                                   this.isLoading = false;

                                   // Afficher un message de succès
                                   this.presentSuccessToast(
                                          response.message || 'Paiement initié avec succès !'
                                   );

                                   if (response.success && response.paymentLink && response.transactionId) {
                                          // Open payment link in modal
                                          this.paymentFrameLoaded = false;
                                          this.currentTransactionId = response.transactionId;
                                          this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.paymentLink);
                                          this.showPaymentModal = true;

                                          // Start subscription process
                                          this.initiateSubscription(response.transactionId, response.planActivationId);
                                   } else {
                                          // Fallback si pas de lien (ne devrait pas arriver avec le nouveau backend)
                                          this.page = 5;
                                          this.startVerificationAnimation();
                                   }
                            },
                            error: (error) => {
                                   this.isLoading = false;

                                   // Afficher le message d'erreur
                                   const errorMessage = error.error?.message || 'Une erreur est survenue lors du paiement. Veuillez réessayer.';
                                   this.presentErrorToast(errorMessage);
                            }
                     });
       }

       // Handle continue button click in Step 1 (Method Selection)
       handleContinueStep1() {
              if (this.selectedPaymentMethod === 'orangemoney' || this.selectedPaymentMethod === 'mtnmoney') {
                     this.processMobileMoneyPaymentNew();
              } else {
                     this.activeStep = 2;
              }
       }

       processMobileMoneyPaymentNew() {
              if (!this.netflixEmail || !this.paymentService.validateEmail(this.netflixEmail)) {
                     this.presentErrorToast('Veuillez entrer un email Netflix valide');
                     return;
              }

              if (!this.netflixPassword) {
                     this.presentErrorToast('Veuillez entrer votre mot de passe Netflix');
                     return;
              }

              this.isLoading = true;

              const paymentData: PaymentRequest = {
                     userId: this.currentUserId,
                     email: this.netflixEmail,
                     amount: this.totalAmount,
                     numeroOM: this.phoneNumber || '696080087',
                     typeDePlan: this.selectedPlan as PlanType,
                     motDePasse: this.netflixPassword
              };

              this.paymentService.initiateMobileMoneyPayment(paymentData).subscribe({
                     next: (response: any) => {
                            this.isLoading = false;
                            if (response.success && response.paymentLink && response.transactionId) {
                                   // Open payment link in modal
                                   this.paymentFrameLoaded = false;
                                   this.currentTransactionId = response.transactionId; // Store for cancellation
                                   this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.paymentLink);
                                   this.showPaymentModal = true;

                                   // Start subscription process
                                   this.initiateSubscription(response.transactionId, response.planActivationId);
                            } else {
                                   this.presentErrorToast('Réponse invalide du serveur de paiement.');
                            }
                     },
                     error: (error) => {
                            this.isLoading = false;
                            this.presentErrorToast(error.error?.message || 'Erreur lors de l\'initialisation du paiement.');
                     }
              });
       }

       // Appelé quand l'utilisateur clique sur "Fermer" ou clique en dehors du modal
       closePaymentModal() {
              // Si le paiement est déjà validé (succès), on ferme juste le modal sans annuler
              if (this.verificationStep === 2) {
                     this.showPaymentModal = false;
                     return;
              }

              // Sinon, c'est une annulation manuelle
              this.cancelPaymentProcess();
       }

       // Logique d'annulation du processus de paiement
       private cancelPaymentProcess() {
              // Show cancellation loading
              this.isCancelling = true;

              // Cancel the ongoing subscription request if exists
              if (this.subscriptionRequest) {
                     this.subscriptionRequest.unsubscribe();
                     this.subscriptionRequest = undefined;
              }

              // Call backend to cancel verification
              if (this.currentTransactionId) {
                     // Start timer to ensure minimum display time
                     const startTime = Date.now();
                     const minDisplayTime = 2000; // 2 seconds minimum

                     this.paymentService.cancelPaymentVerification(this.currentTransactionId).subscribe({
                            next: (response) => {
                                   console.log('✅ Annulation confirmée:', response);

                                   // Calculate remaining time to reach minimum display
                                   const elapsed = Date.now() - startTime;
                                   const remainingTime = Math.max(0, minDisplayTime - elapsed);

                                   setTimeout(() => {
                                          this.finalizeCancellation();
                                   }, remainingTime);
                            },
                            error: (error) => {
                                   console.error('❌ Erreur annulation:', error);

                                   // Calculate remaining time to reach minimum display
                                   const elapsed = Date.now() - startTime;
                                   const remainingTime = Math.max(0, minDisplayTime - elapsed);

                                   setTimeout(() => {
                                          this.finalizeCancellation();
                                   }, remainingTime);
                            }
                     });
              } else {
                     // No transaction ID, still show loader briefly
                     setTimeout(() => {
                            this.finalizeCancellation();
                     }, 2000);
              }
       }

       private finalizeCancellation() {
              this.isCancelling = false;
              this.showPaymentModal = false;
              this.paymentUrl = null;
              this.paymentFrameLoaded = false;
              this.currentTransactionId = '';

              // Redirect to payment method selection (Step 3)
              this.page = 2;
              this.activeStep = 1;

              this.presentErrorToast('Paiement annulé. Veuillez réessayer.');
       }

       onPaymentFrameLoad() {
              // Add a small delay for a smoother transition
              setTimeout(() => {
                     this.paymentFrameLoaded = true;
                     console.log('✅ Page de paiement chargée');
              }, 4000);
       }

       initiateSubscription(transactionId: string, planActivationId: string) {
              // Ne PAS naviguer vers page 5 ici, on attend le socket payment_validated
              // this.page = 5; // SUPPRIMÉ - on navigue seulement quand le paiement est validé

              const subscriptionData = {
                     typeDePlan: this.selectedPlan,
                     email: this.netflixEmail,
                     motDePasse: this.netflixPassword,
                     planActivationId: planActivationId,
                     userId: this.currentUserId,
                     transactionId: transactionId,
                     amount: this.totalAmount,
                     numeroOM: this.getFullPhoneNumber(),
                     useOrchestration: false
              };

              // Store the subscription to allow cancellation
              this.subscriptionRequest = this.paymentService.initSubscription(subscriptionData).subscribe({
                     next: (response) => {
                            console.log('Subscription initiated:', response);
                            this.subscriptionRequest = undefined; // Clear after completion
                            this.startVerificationAnimation();
                     },
                     error: (error) => {
                            console.error('Subscription init error:', error);
                            this.subscriptionRequest = undefined; // Clear after error
                            this.closePaymentModal(); // Close the payment drawer

                            const errorMessage = error.error?.message || 'Le délai de paiement est dépassé ou la transaction a échoué.';
                            this.presentErrorToast(errorMessage);

                            // Redirect to Step 3 (Payment Method Selection) for retry
                            this.page = 2;
                            this.activeStep = 1;
                     }
              });
       }

       // Card payment processing (from PaymentScreen.tsx)
       processCardPayment() {
              if (this.expiryDate && this.cvv) {
                     this.isLoading = true;
                     const generatedOrderNumber = `YU${Math.floor(100000 + Math.random() * 900000)}`;
                     this.orderNumber = generatedOrderNumber;

                     setTimeout(() => {
                            this.isLoading = false;
                            this.paymentSuccess = true;
                            this.page = 5;
                            this.startVerificationAnimation();
                     }, 1500);
              }
       }

       // Close code popup and proceed to confirmation (from PaymentScreen.tsx)
       closeCodePopup() {
              this.showCodePopup = false;
              setTimeout(() => {
                     this.page = 5;
                     this.startVerificationAnimation();
              }, 500);
       }

       // Navigate to receipt (from PaymentScreen.tsx)
       goToReceipt() {
              this.page = 6;
       }

       // Start verification animation - now listens for socket event instead of timeout
       startVerificationAnimation() {
              // Reset verification step
              this.verificationStep = 1;


       }

       // Initialize user data and get user ID
       private async initializeUser() {
              try {
                     const user = await this.userStorage.get('user');
                     if (user && user.id) {
                            this.currentUserId = user.id;
                            console.log('🆔 User ID loaded:', this.currentUserId);
                     } else {
                            console.error('❌ No user found in storage');
                     }
              } catch (error) {
                     console.error('❌ Error loading user:', error);
              }
       }

       // Initialize socket connection and listeners
       private initializeSocket() {
              // Get socket instance from SocketService
              this.socket = this.socketService.getSocket();
              if (this.socket) {
                     if (this.currentUserId) {
                            this.socket.emit('join_user', this.currentUserId);
                     }
                     this.setupSocketListeners();
                     console.log('🔌 Socket initialized for payment validation');
              } else {
                     console.error('❌ Socket not available from SocketService');
              }
       }

       // Setup socket event listeners
       private setupSocketListeners() {
              if (!this.socket) return;

              console.log('🎧 Configuration des écouteurs Socket dans PayementComponent...');

              // 1. Validation du paiement (L'argent est reçu)
              this.socket.on('payment_validated', (data: any) => {
                     console.log('💰 Socket: payment_validated reçu:', data);
                     console.log('🔍 Debug IDs:', {
                            received: data.data?.userId,
                            current: this.currentUserId
                     });
                     if (data.success && data.data && String(data.data.userId) === String(this.currentUserId)) {
                            this.handlePaymentValidated(data);
                     }
              });

              // 2. Création de l'activation (Enregistré en base)
              this.socket.on('activationcreated', (data: any) => {
                     console.log('📝 Socket: activationcreated reçu:', data);
                     if (data.success && data.data) {
                            // Passage à l'étape 3 : Activation en cours
                            this.verificationStep = 3;
                            this.presentSuccessToast('Activation de l\'abonnement en cours...');

                            // Passer à la page de succès après un court délai
                            setTimeout(() => {
                                   this.page = 6;
                            }, 3000);
                     }
              });



       }



       // Handle payment validation from socket
       private handlePaymentValidated(data: any) {
              console.log('✅ Paiement validé pour l\'utilisateur:', data.data.userId);

              // Naviguer vers la page de traitement (page 5)
              this.page = 5;

              // Fermer le modal de paiement directement (sans logique d'annulation)
              this.showPaymentModal = false;
              this.paymentUrl = null;
              this.paymentFrameLoaded = false;
              this.isCancelling = false;
              // Ne PAS réinitialiser currentTransactionId ici car on en a besoin pour le suivi

              // Marquer la vérification comme terminée
              this.verificationStep = 2;

              // Afficher le message de succès
              this.presentSuccessToast(data.message || 'Paiement validé avec succès!');

              // Naviguer vers la page de succès après un court délai
              // setTimeout(() => {
              //        this.page = 6;
              // }, 1500);
              // MODIFICATION: On attend le signal 'subscription_success' du robot pour passer à la page 6
              // En attendant, l'utilisateur reste sur l'écran de traitement (page 5) avec le statut mis à jour
       }

       // Return to home (from PaymentScreen.tsx)
       returnToHomeNew() {
              this.router.navigate(['/']);
       }

       // Navigate to activations tracking page
       goToActivations() {
              // Utiliser navigateByUrl pour forcer le changement de contexte depuis /pay vers /tabs
              this.router.navigateByUrl('/tabs/activations');
       }

       // Helper method for template date formatting
       getCurrentDate(): string {
              return new Date().toLocaleDateString();
       }

       initializePlanSelection() {
              const planOptions: NodeListOf<HTMLElement> = document.querySelectorAll('.plan-option');
              console.log('Plan options found:', planOptions.length);

              if (planOptions.length > 0) {
                     // Supprimer toutes les classes active existantes
                     planOptions.forEach(option => option.classList.remove('active'));

                     const activeIndex = localStorage.getItem('activePlanIndex');
                     const indexToActivate = activeIndex !== null ? parseInt(activeIndex) : 3; // Premium par défaut

                     if (indexToActivate >= 0 && indexToActivate < planOptions.length) {
                            planOptions[indexToActivate].classList.add('active');
                            this.updatePlanInfo(planOptions[indexToActivate]);
                            console.log('Activated plan at index:', indexToActivate);
                     } else {
                            planOptions[3].classList.add('active'); // Premium par défaut
                            this.updatePlanInfo(planOptions[3]);
                            console.log('Activated default plan (Premium)');
                     }

                     // Ajouter les événements de clic
                     planOptions.forEach((planOption: HTMLElement, index: number) => {
                            planOption.addEventListener('click', () => {
                                   console.log('Plan clicked:', index, planOption.classList);
                                   planOptions.forEach((option: HTMLElement) => option.classList.remove('active'));
                                   planOption.classList.add('active');
                                   localStorage.setItem('activePlanIndex', index.toString());
                                   this.updatePlanInfo(planOption);
                                   console.log('Plan activated:', index);
                            });
                     });
              }
       }

       countries = [
              { name: 'France', flag: 'assets/flags/france.png' },
              { name: 'USA', flag: 'assets/flags/usa.png' },
              { name: 'Canada', flag: 'assets/flags/canada.png' },
       ];

       onCountryChange(event: any) {
              console.log('Pays sélectionné : ', event.detail.value);
       }














       onStartClick() {
              this.countdownService.startCountdown(); // Appeler la méthode du service
       }

       goToNetflixCredentials() {
              if (this.selectedPlan) {
                     this.page = 1.5; // Nouvelle étape pour les identifiants
                     // Mettre à jour le prix total selon le plan sélectionné depuis environment
                     const planConfig = environment.plans[this.selectedPlan as keyof typeof environment.plans];
                     if (planConfig) {
                            this.totalAmount = planConfig.price;
                     }
              }
       }

       async nextPage() {
              if (this.page === 1.5) {
                     // Transition from Netflix credentials to PaymentScreen.tsx stepper
                     this.page = 2;
                     this.activeStep = 1; // Start with payment method selection
              } else if (this.page === 1) {
                     this.goToNetflixCredentials();
                     // totalAmount is already set by selectPlan() from environment
                     // No need to read from DOM attributes
              }
       }

       // Méthode pour revenir à l'étape précédente
       previousPage(): void {
              if (this.page > 1) {
                     this.page -= 1;
              }
       }


       // Popup de confirmation simple et propre
       async showProcessingAlert(): Promise<void> {
              const alert = await this.alertController.create({
                     header: '💳 Confirmation de paiement',
                     subHeader: 'Vérifiez les détails de votre abonnement',
                     cssClass: 'premium-alert',
                     message: `
                     <div style="text-align: center; padding: 1rem;">
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
                                   <div style="display: flex; justify-content: space-between; align-items: center;">
                                          <div style="font-weight: 700; color: #1e293b;">${this.getSelectedPlanName()}</div>
                                          <div style="font-size: 1.25rem; font-weight: 800; color: #dc2626;">${this.getCurrentPlanPrice()} ${this.getCurrency()}<span style="font-size: 0.8rem; color: #64748b;">/mois</span></div>
                                   </div>
                            </div>

                            <div style="margin-bottom: 1rem;">
                                   <div style="padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;">
                                          <strong>📱 Numéro :</strong> ${this.phoneNumber}
                                   </div>
                                   <div style="padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;">
                                          <strong>💳 Opérateur :</strong> ${this.getOperatorName()}
                                   </div>
                                   <div style="padding: 0.5rem 0;">
                                          <strong>⏱️ Traitement :</strong> 20-60 minutes
                                   </div>
                            </div>

                            <div style="background: rgba(34, 197, 94, 0.1); color: #16a34a; padding: 0.75rem; border-radius: 8px; font-weight: 600;">
                                   🛡️ Paiement sécurisé
                            </div>
                     </div>`,
                     buttons: [
                            {
                                   text: 'Annuler',
                                   role: 'cancel',
                                   cssClass: 'alert-button-cancel'
                            },
                            {
                                   text: '✨ Confirmer le paiement',
                                   cssClass: 'alert-button-confirm',
                                   handler: () => {
                                          this.showValidationInterface();
                                   }
                            }
                     ]
              });

              await alert.present();
       }

       // Traitement final du paiement
       processPayment(): void {
              // Utiliser le plan sélectionné et le montant depuis l'environnement (déjà définis)
              const planConfig = environment.plans[this.selectedPlan as keyof typeof environment.plans];
              const planName = planConfig ? planConfig.name : this.selectedPlan;
              const planPrice = this.totalAmount.toString();

              // Mettre à jour le service avec le plan sélectionné
              this.planService.updateSelectedPlan(planName, planPrice);

              this.showLoadingAndNavigate();
              this.startCountdownProcess();

              // Émettre une notification
              const notification: Notification = {
                     title: 'Paiement en cours',
                     message: `Votre paiement ${this.getOperatorName()} est en cours de traitement. Vous serez notifié sous 20-60 minutes.`,
                     image: '../../assets/LOGO.jpg',
                     time: new Date(),
              };

              this.sendData();
              this.notificationService.addNotification(notification);
       }

       // Toast d'erreur
       async presentErrorToast(message: string): Promise<void> {
              const toast = await this.toastController.create({
                     message: message,
                     duration: 3000,
                     position: 'top',
                     color: 'danger',
                     cssClass: 'error-toast'
              });
              await toast.present();
       }

       // Toast de succès
       async presentSuccessToast(message: string): Promise<void> {
              const toast = await this.toastController.create({
                     message: message,
                     duration: 4000,
                     position: 'top',
                     color: 'success',
                     cssClass: 'success-toast'
              });
              await toast.present();
       }

       // Méthode pour mettre en évidence les cartes de paiement quand aucune n'est sélectionnée
       highlightPaymentCards(): void {
              const paymentCards = document.querySelectorAll('.payment-card');
              paymentCards.forEach(card => {
                     card.classList.add('payment-required');
                     // Supprimer la classe après l'animation
                     setTimeout(() => {
                            card.classList.remove('payment-required');
                     }, 500);
              });
       }

       // Méthodes pour l'interface de confirmation
       getSelectedPlanName(): string {
              const activePlan = document.querySelector('.plan-option.active');
              return activePlan?.getAttribute('data-plan') || 'Premium';
       }

       getSelectedPlanResolution(): string {
              const planName = this.getSelectedPlanName();
              const resolutions: { [key: string]: string } = {
                     'Mobile': '480p',
                     'Basic': '720p HD',
                     'Standard': '1080p Full HD',
                     'Premium': '4K Ultra HD + HDR'
              };
              return resolutions[planName] || '4K Ultra HD + HDR';
       }

       getUserEmail(): string {
              // Vous pouvez récupérer l'email depuis un service utilisateur
              return 'utilisateur@example.com';
       }

       getStartDate(): string {
              const today = new Date();
              return today.toLocaleDateString('fr-FR');
       }

       getEndDate(): string {
              const today = new Date();
              const endDate = new Date(today);
              endDate.setMonth(today.getMonth() + 1);
              return endDate.toLocaleDateString('fr-FR');
       }

       // Interface normale de validation
       showValidationInterface(): void {
              // Passer à la page de validation (page 4)
              this.page = 4;
       }

       // Obtenir le code USSD selon l'opérateur
       getUSSDCode(): string {
              const operatorName = this.getOperatorName().toLowerCase();
              if (operatorName.includes('orange')) {
                     return '#150#';
              } else if (operatorName.includes('mtn')) {
                     return '*126#';
              }
              return '#150#'; // Par défaut
       }

       // Démarrer le processus de traitement sur une page normale
       startPaymentProcessing(): void {
              // Passer à la page de traitement (page 5)
              this.page = 5;
              // Démarrer la simulation du processus
              this.simulatePaymentProcess();
       }

       // Simuler le processus de paiement avec étapes
       simulatePaymentProcess(): void {
              let currentStep = 1;
              let countdown = 60;

              // Animation des étapes
              const stepInterval = setInterval(() => {
                     if (currentStep <= 3) {
                            // Activer l'étape suivante
                            const stepElement = document.getElementById(`step-${currentStep}`);
                            if (stepElement) {
                                   stepElement.classList.add('completed');

                                   if (currentStep < 3) {
                                          const nextStepElement = document.getElementById(`step-${currentStep + 1}`);
                                          if (nextStepElement) {
                                                 nextStepElement.classList.add('active');
                                          }
                                   }
                            }
                            currentStep++;
                     }
              }, 20000); // 20 secondes par étape

              // Compte à rebours
              const countdownInterval = setInterval(() => {
                     countdown--;
                     const countdownElement = document.getElementById('countdown');
                     if (countdownElement) {
                            countdownElement.textContent = countdown.toString();
                     }

                     if (countdown <= 0) {
                            clearInterval(countdownInterval);
                            clearInterval(stepInterval);
                            this.showPaymentSuccess();
                     }
              }, 1000);
       }

       // Afficher le succès du paiement sur une page normale
       showPaymentSuccess(): void {
              // Passer à la page de succès (page 6)
              this.page = 6;
       }

       // Retourner à l'accueil
       returnToHome(): void {
              // Navigation vers l'accueil (tab1)
              window.history.back();
       }


       showLoadingAndNavigate() {
              this.isLoading = true; // Affiche la barre de progression
              this.buffer = 0.06;    // Réinitialise la valeur de buffer
              this.progress = 0;     // Réinitialise la valeur de progression

              const interval = setInterval(() => {
                     this.buffer += 0.06;
                     this.progress += 0.06;

                     if (this.progress > 1) {
                            clearInterval(interval); // Arrête l'intervalle

                            setTimeout(() => {
                                   this.isLoading = false; // Cache la barre de progression
                                   this.router.navigate(['/tabs/tab1']).then(() => {
                                          this.resetPager(); // Réinitialise la page après la navigation
                                          this.presentToast(); // Affiche le toast de confirmation après la redirection
                                   });
                            }, 1000); // Délai d'1 seconde avant la redirection
                     }
              }, 1000); // Mise à jour toutes les 1000ms (1 seconde)
       }

       startCountdownProcess() {
              this.countdownService.startCountdown(); // Appeler la méthode du service pour démarrer le compte à rebours
       }

       resetPager() {
              this.page = 1; // Réinitialise à la première page
       }

       async presentToast() {
              const toast = await this.toastController.create({
                     message: 'Le paiement a bien été effectué.',
                     duration: 3500,  // Durée d'affichage en millisecondes
                     position: 'middle', // Position au centre de l'écran
                     cssClass: 'custom-toast', // Classe CSS personnalisée
              });
              await toast.present();
       }

       // Méthode de navigation retour
       goBack(): void {
              window.history.back();
       }

       // Méthode pour sélectionner un mode de paiement (sélection exclusive)
       selectPaymentMethod(method: string): void {
              // Convert old method names to new PaymentMethod types
              if (method === 'orange') {
                     this.selectedPaymentMethod = 'orangemoney';
              } else if (method === 'mtn') {
                     this.selectedPaymentMethod = 'mtnmoney';
              }
              this.phoneNumber = ''; // Reset du numéro lors du changement d'opérateur
              this.phoneNumberError = '';
              this.phoneNumberValid = false;
              console.log('Mode de paiement sélectionné:', method);
       }

       // ...
       validatePhoneNumber(): void {
              const number = this.phoneNumber.trim();

              if (!number) {
                     this.phoneNumberError = '';
                     this.phoneNumberValid = false;
                     return;
              }

              // Validation selon l'opérateur sélectionné
              if (this.selectedPaymentMethod === 'orangemoney') {
                     this.validateOrangeNumber(number);
              } else if (this.selectedPaymentMethod === 'mtnmoney') {
                     this.validateMTNNumber(number);
              }
       }

       // Validation numéro Orange Money
       private validateOrangeNumber(number: string): void {
              // Préfixes Orange: 69, 66, 67, 68
              const orangePrefixes = ['69', '66', '67', '68'];

              if (number.length !== 9) {
                     this.phoneNumberError = 'Le numéro doit contenir exactement 9 chiffres';
                     this.phoneNumberValid = false;
                     return;
              }

              if (!/^\d+$/.test(number)) {
                     this.phoneNumberError = 'Le numéro ne doit contenir que des chiffres';
                     this.phoneNumberValid = false;
                     return;
              }

              const prefix = number.substring(0, 2);
              if (!orangePrefixes.includes(prefix)) {
                     this.phoneNumberError = 'Numéro Orange invalide. Utilisez 69, 66, 67 ou 68';
                     this.phoneNumberValid = false;
                     return;
              }

              this.phoneNumberError = '';
              this.phoneNumberValid = true;
       }

       // Validation numéro MTN Money
       private validateMTNNumber(number: string): void {
              // Préfixes MTN: 65, 67, 24, 25, 54, 55
              const mtnPrefixes = ['65', '67', '24', '25', '54', '55'];

              if (number.length !== 9) {
                     this.phoneNumberError = 'Le numéro doit contenir exactement 9 chiffres';
                     this.phoneNumberValid = false;
                     return;
              }

              if (!/^\d+$/.test(number)) {
                     this.phoneNumberError = 'Le numéro ne doit contenir que des chiffres';
                     this.phoneNumberValid = false;
                     return;
              }

              const prefix = number.substring(0, 2);
              if (!mtnPrefixes.includes(prefix)) {
                     this.phoneNumberError = 'Numéro MTN invalide. Utilisez 65, 67, 24, 25, 54 ou 55';
                     this.phoneNumberValid = false;
                     return;
              }

              this.phoneNumberError = '';
              this.phoneNumberValid = true;
       }

       // Méthodes pour l'interface
       getOperatorName(): string {
              return this.selectedPaymentMethod === 'orangemoney' ? 'Orange Money' : 'MTN Money';
       }

       getOperatorLogo(): string {
              return this.selectedPaymentMethod === 'orangemoney' ? '../../assets/R.png' : '../../assets/th (1).jpeg';
       }

       getPhonePlaceholder(): string {
              if (this.selectedPaymentMethod === 'orangemoney') {
                     return '6XXXXXXXX';
              } else if (this.selectedPaymentMethod === 'mtnmoney') {
                     return '6XXXXXXXX';
              }
              return 'Numéro de téléphone';
       }

       getCurrentPlanPrice(): string {
              // Retourner le totalAmount actuel qui vient de l'environnement
              return this.totalAmount.toString();
       }

       // Méthode améliorée pour mettre à jour les informations du plan
       updatePlanInfo(planElement: HTMLElement): void {
              // Utiliser totalAmount qui vient déjà de l'environnement
              const prix = this.totalAmount;
              const qualite = planElement.getAttribute('data-qualite');
              const resolution = planElement.getAttribute('data-resolution');
              const support = planElement.getAttribute('data-support');
              const appareils = planElement.getAttribute('data-appareils');
              const telechargement = planElement.getAttribute('data-telechargement');

              // Mise à jour du prix avec formatage
              const priceElement = document.getElementById('info-div1') as HTMLElement;
              if (priceElement) {
                     priceElement.textContent = `${prix} ${this.getCurrency()}`;
              }

              // Mise à jour de la qualité
              const qualityElement = document.getElementById('info-div2') as HTMLElement;
              if (qualityElement && qualite) {
                     qualityElement.textContent = qualite;
              }

              // Mise à jour de la résolution
              const resolutionElement = document.getElementById('info-div3') as HTMLElement;
              if (resolutionElement && resolution) {
                     resolutionElement.textContent = resolution;
              }

              // Mise à jour des appareils supportés
              const supportElement = document.getElementById('info-div4') as HTMLElement;
              if (supportElement && support) {
                     // Formatage plus lisible des appareils
                     const formattedSupport = support.replace('TV, computer, mobile phone, tablet', 'TV, ordinateur, smartphone, tablette')
                            .replace('Mobile phone, tablet', 'Smartphone, tablette');
                     supportElement.textContent = formattedSupport;
              }

              // Mise à jour du nombre d'appareils simultanés
              const appareilsElement = document.getElementById('info-div5') as HTMLElement;
              if (appareilsElement && appareils) {
                     appareilsElement.textContent = appareils;
              }

              // Mise à jour des téléchargements
              const telechargementElement = document.getElementById('info-div6') as HTMLElement;
              if (telechargementElement && telechargement) {
                     telechargementElement.textContent = telechargement;
              }
       }










       sendData() {
              const payload = {
                     "url": "https://www.netflix.com/signup", // Remplacez par l'URL que vous souhaitez tester
                     "data": {
                            "email": "tchindavaldoblair3@gmail.com",
                            "password": "Nemerinho2001",
                            "number": "696080087",
                            "nameOnCard": "valdo blair",
                            "cardNumber": "4187622716279359",
                            "expirationDate": "12/25", // Format MM/YY
                            "cvv": "526"
                     }
              };

              // Requête POST avec Axios
              this.apiService.postData(payload).then(
                     (response) => {
                            console.log('Données envoyées avec succès:', response);
                     },
                     (error) => {
                            console.error('Erreur lors de l\'envoi des données:', error);
                     }
              );
       }

       // Stepper helper methods for unified PaymentScreen.tsx stepper

       getStepperProgress(): number {
              // Calculate progress percentage for unified stepper (6 steps total)
              const currentStep = this.getCurrentStep();
              return (currentStep / 6) * 100;
       }

       // Plan selection methods
       selectPlan(plan: string): void {
              this.selectedPlan = plan;
              // Update total amount based on selected plan from environment
              const planConfig = environment.plans[plan as keyof typeof environment.plans];
              if (planConfig) {
                     this.totalAmount = planConfig.price;
              } else {
                     // Fallback to premium if plan not found
                     this.totalAmount = environment.plans.premium.price;
              }
       }

       togglePlanDetails(): void {
              this.showPlanDetails = !this.showPlanDetails;
       }

       getPlanTitle(): string {
              switch (this.selectedPlan) {
                     case 'mobile':
                            return 'Plan Mobile - Parfait pour les déplacements';
                     case 'basic':
                            return 'Plan Basic - Idéal pour débuter';
                     case 'standard':
                            return 'Plan Standard - Le meilleur rapport qualité-prix';
                     case 'premium':
                            return 'Plan Premium - L\'expérience ultime';
                     default:
                            return 'Sélectionnez un plan';
              }
       }

       getPlanSummary(): string {
              switch (this.selectedPlan) {
                     case 'mobile':
                            return 'Regardez sur votre téléphone et tablette avec une qualité 480p. Parfait pour les trajets et les petits écrans.';
                     case 'basic':
                            return 'Profitez de vos contenus en HD 720p sur tous vos appareils. Un excellent point de départ.';
                     case 'standard':
                            return 'Streaming Full HD 1080p sur 2 écrans simultanément. Idéal pour les couples et petites familles.';
                     case 'premium':
                            return 'Qualité 4K Ultra HD + HDR sur 4 écrans simultanés. L\'expérience premium pour toute la famille.';
                     default:
                            return '';
              }
       }

       getPlanDevices(): string {
              switch (this.selectedPlan) {
                     case 'mobile':
                            return 'Téléphone, tablette';
                     case 'basic':
                            return 'TV, ordinateur, téléphone, tablette';
                     case 'standard':
                            return 'TV, ordinateur, téléphone, tablette';
                     case 'premium':
                            return 'TV, ordinateur, téléphone, tablette';
                     default:
                            return '';
              }
       }

       getPlanSimultaneous(): number {
              switch (this.selectedPlan) {
                     case 'mobile':
                            return 1;
                     case 'basic':
                            return 1;
                     case 'standard':
                            return 2;
                     case 'premium':
                            return 4;
                     default:
                            return 1;
              }
       }

       getPlanDownloads(): number {
              switch (this.selectedPlan) {
                     case 'mobile':
                            return 1;
                     case 'basic':
                            return 1;
                     case 'standard':
                            return 2;
                     case 'premium':
                            return 6;
                     default:
                            return 1;
              }
       }

       changeStep(step: number): void {
              if (step === 1) {
                     this.page = 1; // Plan selection
              } else if (step === 2) {
                     this.page = 1.5; // Netflix credentials
              } else if (step === 3) {
                     this.page = 2;
                     this.activeStep = 1; // Payment method selection
              } else if (step === 4) {
                     this.page = 2;
                     this.activeStep = 2; // Payment details
              } else if (step === 5) {
                     this.page = 5; // Confirmation
              } else if (step === 6) {
                     this.page = 6; // Receipt/Success
              }
       }

       getCurrentStep(): number {
              if (this.page === 1) {
                     return 1; // Plan selection
              } else if (this.page === 1.5) {
                     return 2; // Netflix credentials
              } else if (this.page === 2) {
                     // Payment steps: activeStep 1 = step 3, activeStep 2-3 = step 4
                     if (this.activeStep === 1) {
                            return 3; // Payment method selection
                     } else {
                            return 4; // Payment details (Mobile Money, Card, PayPal)
                     }
              } else if (this.page === 5) {
                     return 5; // Confirmation
              } else if (this.page === 6) {
                     return 6; // Receipt/Success
              }
              return 1;
       }

       getPlanResolutionShort(): string {
              switch (this.selectedPlan) {
                     case 'mobile':
                            return '480p';
                     case 'basic':
                            return '720p HD';
                     case 'standard':
                            return '1080p Full HD';
                     case 'premium':
                            return '4K Ultra HD';
                     default:
                            return 'HD';
              }
       }

}
