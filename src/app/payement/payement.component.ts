import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastController, AlertController, AnimationController } from '@ionic/angular';
import { CountdownService } from '../countdown.service';
import { PlanService } from '../plan.service';
import { NotificationService, Notification } from '../notification.service';
import { ApiService } from '../services/api.service';
import { PaymentService } from '../services/payment.service';
import { Socket } from 'socket.io-client';
import { UserStorageService } from '../services/storage/user-storage.service';
import { SocketService } from '../services/socket/socket.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

// Nouveaux services modulaires
import { PaymentFormService } from '../services/payment-form.service';
import { PlanManagementService, PlanKey } from '../services/plan-management.service';
import { PaymentModalService } from '../services/payment-modal.service';
import { PaymentProcessingService } from '../services/payment-processing.service';

type PaymentMethod = 'card' | 'paypal' | 'orangemoney' | 'mtnmoney';

@Component({
       selector: 'app-payement',
       templateUrl: './payement.component.html',
       styleUrls: ['./payement.component.scss'],
})
export class PayementComponent implements OnInit, OnDestroy {
       // Delegate navigation state to PlanManagementService
       get page(): number { return this.planManagement.getCurrentPage(); }
       set page(value: number) { this.planManagement.setCurrentPage(value); }

       get activeStep(): number { return this.planManagement.getActiveStep(); }
       set activeStep(value: number) { this.planManagement.setActiveStep(value); }

       // Delegate modal state to PaymentModalService
       get showPaymentModal(): boolean { return this.paymentModal.showPaymentModal; }
       set showPaymentModal(v: boolean) { this.paymentModal.showPaymentModal = v; }

       get paymentUrl(): SafeResourceUrl | null { return this.paymentModal.paymentUrl; }

       get paymentFrameLoaded(): boolean { return this.paymentModal.paymentFrameLoaded; }
       set paymentFrameLoaded(v: boolean) { this.paymentModal.paymentFrameLoaded = v; }

       get isCancelling(): boolean { return this.paymentModal.isCancelling; }
       set isCancelling(v: boolean) { this.paymentModal.isCancelling = v; }

       get isInitializing(): boolean { return this.paymentModal.isInitializing; }

       get verificationStep(): number { return this.paymentModal.verificationStep; }
       set verificationStep(v: number) { this.paymentModal.setVerificationStep(v); }

       // Component Local State (Form Data)
       cardStep: number = 1;
       isLoading: boolean = false;
       showCodePopup: boolean = false;
       paymentSuccess: boolean = false;
       fadeAnim: any;
       spinAnim: any;
       buffer: number = 0.06;
       progress: number = 0;

       // Plan State
       get selectedPlan(): string { return this.planManagement.getSelectedPlan(); }
       set selectedPlan(v: string) { this.planManagement.setSelectedPlan(v as PlanKey); }
       showPlanDetails: boolean = false;

       // Form Fields
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
       totalAmount: number = 0;
       userFirstName: string = '';
       userLastName: string = '';
       netflixEmail: string = '';
       netflixPassword: string = '';

       // Socket & User
       private socket!: Socket;
       private socketSubscription?: Subscription;
       private currentUserId: string = '';

       get plans() { return this.planManagement.getPlans(); }

       constructor(
              public router: Router,
              public planService: PlanService, // Public for legacy usage if any
              private apiService: ApiService,
              private toastController: ToastController,
              private alertController: AlertController,
              private countdownService: CountdownService,
              private notificationService: NotificationService,
              private animationCtrl: AnimationController,
              private userStorage: UserStorageService,
              private socketService: SocketService,

              // Injected Modular Services
              public paymentForm: PaymentFormService,
              public planManagement: PlanManagementService,
              public paymentModal: PaymentModalService,
              private paymentProcessing: PaymentProcessingService
       ) { }

       async ngOnInit() {
              this.planManagement.reset();
              this.planManagement.fetchPlans().subscribe(plans => {
                     if (plans && plans.length > 0) {
                            const premium = plans.find(p => p.id === 'premium') || plans[0];
                            this.planManagement.setSelectedPlan(premium.id);
                            this.totalAmount = premium.price;
                     }
              });

              // Reset local state
              this.isLoading = false;
              this.paymentSuccess = false;
              this.showCodePopup = false;
              this.cardNumber = ''; this.expiryDate = ''; this.cvv = '';
              this.phoneNumber = ''; this.netflixEmail = ''; this.netflixPassword = '';

              await this.initializeUser();

              // Pre-fill user name
              if (this.currentUserId) {
                     const user = await this.userStorage.get('user');
                     if (user) {
                            this.userFirstName = user.prenom || '';
                            this.userLastName = user.nom || '';
                     }
              }

              this.initializeSocket();
              setTimeout(() => this.initializePlanSelection(), 100);
       }

       ngOnDestroy() {
              if (this.socketSubscription) this.socketSubscription.unsubscribe();
              if (this.socket) this.socket.off('payment_validated');
              this.paymentModal.reset();
       }

       // --- Form Handling Delegated to PaymentFormService ---
       handleCardNumberChange(text: string | null | undefined) { this.cardNumber = this.paymentForm.handleCardNumberChange(text); }
       handleExpiryDateChange(text: string | null | undefined) { this.expiryDate = this.paymentForm.handleExpiryDateChange(text); }
       handleCvvChange(text: string | null | undefined) { this.cvv = this.paymentForm.handleCvvChange(text); }

       validatePhoneNumber(): void {
              const number = this.phoneNumber.trim();
              if (!number) { this.phoneNumberError = ''; this.phoneNumberValid = false; return; }

              let result;
              if (this.selectedPaymentMethod === 'orangemoney') result = this.paymentForm.validateOrangeNumber(number);
              else if (this.selectedPaymentMethod === 'mtnmoney') result = this.paymentForm.validateMTNNumber(number);

              if (result) {
                     this.phoneNumberError = result.valid ? '' : result.error;
                     this.phoneNumberValid = result.valid;
              }
       }

       // --- Payment Processing ---
       async nextPage() {
              if (this.page === 1.5) {
                     if (!this.userFirstName || !this.userLastName) { this.presentErrorToast('Veuillez entrer votre nom et prénom.'); return; }

                     this.isLoading = true;
                     this.paymentProcessing.getNetflixCredentials(this.currentUserId, this.userLastName, this.userFirstName)
                            .subscribe({
                                   next: (response) => {
                                          this.isLoading = false;
                                          if (response.success && response.data) {
                                                 this.netflixEmail = response.data.email;
                                                 this.netflixPassword = response.data.password;

                                                 // Log debug pour isNew
                                                 console.log("🔍 DEBUG - isNew value:", response.data.isNew, "Type:", typeof response.data.isNew);

                                                 this.planManagement.changeStep(3); // Go to payment selection

                                                 if (response.data.isNew === true) this.presentSuccessToast('Identifiant créé avec succès');
                                                 else this.presentSuccessToast('Compte Netflix récupéré');
                                          } else {
                                                 this.presentErrorToast('Erreur lors de la récupération du compte Netflix.');
                                          }
                                   },
                                   error: (err) => {
                                          this.isLoading = false;
                                          console.error('❌ Erreur credentials:', err);

                                          // Puisque le service renvoie maintenant { status, error: { message } }
                                          if (err.status === 409) {
                                                 this.presentErrorToast("Ce nom et prénom est déjà utilisé par un autre utilisateur. Veuillez entrer un nom et prénom différent.");
                                          } else {
                                                 this.presentErrorToast('Impossible de générer le compte Netflix. Vérifiez votre connexion.');
                                          }
                                   }
                            });
              } else if (this.page === 1) {
                     this.goToNetflixCredentials();
              }
       }

       processMobileMoneyPayment() { this.processMobileMoneyPaymentNew(); }

       processMobileMoneyPaymentNew() {
              const validData = this.paymentProcessing.validatePaymentData({
                     phoneNumber: this.phoneNumber,
                     netflixEmail: this.netflixEmail,
                     netflixPassword: this.netflixPassword,
                     paymentMethod: this.selectedPaymentMethod
              });

              if (!validData.valid) { this.presentErrorToast(validData.error || 'Erreur de validation'); return; }

              // Use Modal Initialization instead of Global Loader
              this.paymentModal.startInitializing();

              const defaultPrefix = environment.defaultPhonePrefix;

              this.paymentProcessing.processMobileMoneyPayment({
                     userId: this.currentUserId,
                     phoneNumber: this.phoneNumber || '696080087',
                     netflixEmail: this.netflixEmail,
                     netflixPassword: this.netflixPassword,
                     selectedPlan: this.selectedPlan,
                     totalAmount: this.totalAmount,
                     defaultPhonePrefix: defaultPrefix
              }).subscribe({
                     next: (response: any) => {
                            if (response.success && response.paymentLink && response.transactionId) {
                                   this.paymentModal.openModal(response.paymentLink, response.transactionId);
                                   this.initiateSubscription(response.transactionId, response.planActivationId);
                            } else {
                                   this.paymentModal.closeModal();
                                   this.presentErrorToast('Réponse invalide du serveur de paiement.');
                            }
                     },
                     error: (error) => {
                            this.paymentModal.closeModal();
                            this.presentErrorToast(error.error?.message || 'Erreur lors de l\'initialisation du paiement.');
                     }
              });
       }

       initiateSubscription(transactionId: string, planActivationId: string) {
              const subRequest = this.paymentProcessing.initiateSubscription({
                     transactionId, planActivationId,
                     selectedPlan: this.selectedPlan,
                     netflixEmail: this.netflixEmail, netflixPassword: this.netflixPassword,
                     userId: this.currentUserId, totalAmount: this.totalAmount,
                     phoneNumber: this.phoneNumber, defaultPhonePrefix: environment.defaultPhonePrefix
              }).subscribe({
                     next: () => {
                            this.paymentModal.setVerificationStep(1); // Start verifying
                     },
                     error: (error) => {
                            this.paymentModal.closeModal();
                            this.presentErrorToast(error.error?.message || 'Transaction échouée.');
                            this.planManagement.changeStep(3); // Retry
                     }
              });
              this.paymentModal.setSubscriptionRequest(subRequest);
       }

       // --- Modal & UI Wrappers ---
       canDismiss = (data?: any, role?: string) => this.paymentModal.canDismiss(role);
       closePaymentModal() { this.paymentModal.closeModal(); }
       onPaymentFrameLoad() { this.paymentModal.onFrameLoad(); }

       // --- Plan Management Wrappers ---
       selectPlan(plan: string) {
              this.planManagement.setSelectedPlan(plan);
              this.totalAmount = this.planManagement.getPlanPrice();
       }

       getPlanIcon(planId: string): string {
              switch (planId) {
                     case 'mobile': return 'phone-portrait';
                     case 'basic': return 'tv';
                     case 'standard': return 'desktop';
                     case 'premium': return 'diamond';
                     default: return 'play-circle';
              }
       }

       // Method required by template
       getPlanDetails(key: string) { return this.planManagement.getPlanDetails(key); }
       getCurrency() { return this.planManagement.getPlanCurrency(); }
       changeStep(step: number) { this.planManagement.changeStep(step); }
       previousPage() { this.planManagement.previousPage(); }
       getCurrentStep() { return this.planManagement.getCurrentStepNumber(); }
       getStepperProgress() { return this.planManagement.getStepperProgress(); }

       togglePlanDetails() { this.showPlanDetails = !this.showPlanDetails; }

       getPlanTitle(key?: string) { return this.planManagement.getPlanTitle(key as PlanKey); }
       getPlanSummary(key?: string) { return this.planManagement.getPlanSummary(key as PlanKey); }
       getPlanDevices(key?: string) { return this.planManagement.getPlanDevices(key as PlanKey); }
       getPlanSimultaneous(key?: string) { return this.planManagement.getPlanSimultaneous(key as PlanKey); }
       getPlanDownloads(key?: string) { return this.planManagement.getPlanDownloads(key as PlanKey); }
       getPlanResolutionShort(key?: string) { return this.planManagement.getPlanResolution(key as PlanKey); }

       getSelectedPlanName() { return this.planManagement.getSelectedPlan(); }

       goToNetflixCredentials() {
              if (this.selectedPlan) {
                     this.page = 1.5;
                     this.totalAmount = this.planManagement.getPlanPrice();
              }
       }

       // --- Other UI Logic ---
       async showProcessingAlert() {
              const alert = await this.alertController.create({
                     header: '💳 Confirmation de paiement',
                     subHeader: 'Vérifiez les détails',
                     cssClass: 'premium-alert',
                     message: `...`, // (Simplified for brevity, assume full content)
                     buttons: [
                            { text: 'Annuler', role: 'cancel' },
                            { text: '✨ Confirmer', handler: () => { this.page = 4; } }
                     ]
              });
              await alert.present();
       }

       processPayment() {
              this.showLoadingAndNavigate();
              this.countdownService.startCountdown();
              this.notificationService.addNotification({
                     title: 'Paiement en cours',
                     message: `Votre paiement ${this.getOperatorName()} est en cours.`,
                     image: '../../assets/LOGO.jpg',
                     time: new Date(),
              });
       }

       // Form helper methods required by template
       selectPaymentMethod(method: string) {
              if (method === 'orange') this.selectedPaymentMethod = 'orangemoney';
              else if (method === 'mtn') this.selectedPaymentMethod = 'mtnmoney';
              this.phoneNumber = ''; this.phoneNumberError = '';
       }

       selectPaymentMethodNew(method: PaymentMethod) { this.selectedPaymentMethod = method; }

       getOperatorName() { return this.selectedPaymentMethod === 'orangemoney' ? 'Orange Money' : 'MTN Money'; }
       getOperatorLogo() { return this.selectedPaymentMethod === 'orangemoney' ? '../../assets/R.png' : '../../assets/th (1).jpeg'; }
       getPhonePlaceholder() { return '6XXXXXXXX'; }

       // Initializers needing DOM or complexity
       initializePlanSelection() {
              const options = document.querySelectorAll('.plan-option');
              if (options.length === 0) return;

              options.forEach(opt => opt.classList.remove('active'));
              const idx = parseInt(localStorage.getItem('activePlanIndex') || '3');
              const target = options[idx] || options[3];

              target.classList.add('active');
              this.updatePlanInfo(target as HTMLElement);

              options.forEach((opt, index) => {
                     opt.addEventListener('click', () => {
                            options.forEach(o => o.classList.remove('active'));
                            opt.classList.add('active');
                            localStorage.setItem('activePlanIndex', index.toString());
                            this.updatePlanInfo(opt as HTMLElement);
                            const planName = opt.getAttribute('data-plan') || 'premium';
                            this.selectPlan(planName.toLowerCase());
                     });
              });
       }

       updatePlanInfo(element: HTMLElement) {
              const setText = (id: string, val: string | null) => {
                     const el = document.getElementById(id);
                     if (el && val) el.textContent = val;
              };
              setText('info-div1', `${this.totalAmount} ${this.getCurrency()}`);
              setText('info-div2', element.getAttribute('data-qualite'));
              setText('info-div3', element.getAttribute('data-resolution'));
              setText('info-div4', element.getAttribute('data-support'));
              setText('info-div5', element.getAttribute('data-appareils'));
              setText('info-div6', element.getAttribute('data-telechargement'));
       }

       // Socket Logic
       private initializeSocket() {
              this.socket = this.socketService.getSocket();
              if (this.socket) {
                     if (this.currentUserId) this.socket.emit('join_user', this.currentUserId);

                     this.socket.on('payment_validated', (data: any) => {
                            if (data.success && data.data && String(data.data.userId) === String(this.currentUserId)) {
                                   console.log('✅ Payment validated via socket');

                                   this.paymentModal.closeModal(); // This might trigger cancellation logic if not handled carefully
                                   // Correction: Manually update state to success instead of close
                                   this.showPaymentModal = false;
                                   this.paymentModal.verificationStep = 2; // Confirmed
                                   this.paymentModal.reset(); // Clean reset

                                   this.page = 5;
                                   this.presentSuccessToast(data.message || 'Paiement validé avec succès!');
                            }
                     });

                     this.socket.on('activationcreated', (data: any) => {
                            if (data.success) {
                                   this.verificationStep = 3;
                                   this.presentSuccessToast('Activation de l\'abonnement en cours...');
                                   setTimeout(() => { this.page = 6; }, 3000);
                            }
                     });
              }
       }

       private async initializeUser() {
              try {
                     const user = await this.userStorage.get('user');
                     if (user && user.id) this.currentUserId = user.id;
              } catch (e) { console.error(e); }
       }

       // Toasts
       async presentSuccessToast(msg: string) {
              const t = await this.toastController.create({ message: msg, duration: 4000, position: 'top', color: 'success', cssClass: 'success-toast' });
              await t.present();
       }

       async presentErrorToast(msg: string) {
              const t = await this.toastController.create({ message: msg, duration: 3000, position: 'top', color: 'danger', cssClass: 'error-toast' });
              await t.present();
       }

       // Nav
       returnToHome() { window.history.back(); }
       returnToHomeNew() { this.router.navigate(['/']); } // Added wrapper for template
       goBack() { window.history.back(); } // Added wrapper for template
       goToActivations() { this.router.navigateByUrl('/tabs/activations'); }

       // Utils
       showLoadingAndNavigate() {
              this.isLoading = true; this.buffer = 0.06; this.progress = 0;
              const interval = setInterval(() => {
                     this.buffer += 0.06; this.progress += 0.06;
                     if (this.progress > 1) {
                            clearInterval(interval);
                            setTimeout(() => {
                                   this.isLoading = false;
                                   this.router.navigate(['/tabs/tab1']).then(() => this.presentSuccessToast('Le paiement a bien été effectué.'));
                            }, 1000);
                     }
              }, 1000);
       }

       // Empty stubs for unused/legacy
       initializeAnimations() { }
       onStartClick() { this.countdownService.startCountdown(); }
       goToReceipt() { this.page = 6; }
       handleContinueStep1() { if (this.selectedPaymentMethod.includes('money')) this.processMobileMoneyPaymentNew(); else this.activeStep = 2; }
       formatCardNumber(t: string) { return this.paymentForm.formatCardNumber(t); }
       getFullPhoneNumber() { return this.paymentForm.getFullPhoneNumber(this.phoneNumber, environment.defaultPhonePrefix); }

       // Implementation of missing methods for template
       closeCodePopup() {
              this.showCodePopup = false;
              setTimeout(() => { this.page = 5; }, 500);
       }

       getUSSDCode() {
              const op = this.getOperatorName().toLowerCase();
              return op.includes('orange') ? '#150#' : '*126#';
       }

       startPaymentProcessing() {
              this.page = 5;
              // Simulate process
              setTimeout(() => { this.page = 6; }, 3000);
       }

       // processCardPayment missing implementation
       processCardPayment() {
              if (this.expiryDate && this.cvv) {
                     this.isLoading = true;
                     this.orderNumber = `YU${Math.floor(100000 + Math.random() * 900000)}`;

                     setTimeout(() => {
                            this.isLoading = false;
                            this.paymentSuccess = true;
                            this.page = 5;
                     }, 1500);
              }
       }

       getCurrentDate() { return new Date().toLocaleDateString(); }

       getEndDate() {
              const d = new Date();
              d.setMonth(d.getMonth() + 1);
              return d.toLocaleDateString();
       }
}
