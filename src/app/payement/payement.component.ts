import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular'; // Import du ToastController et AlertController
import { CountdownService } from '../countdown.service';
import { PlanService } from '../plan.service'; // Assurez-vous d'importer le service
import { NotificationService, Notification } from '../notification.service';
import { ApiService } from '../services/api.service';

@Component( {
       selector: 'app-payement',
       templateUrl: './payement.component.html',
       styleUrls: [ './payement.component.scss' ],
} )
export class PayementComponent implements OnInit
{

       page: number = 1;          // Débute à la première page
       isLoading: boolean = false; // Indique si la barre de progression doit être affichée
       buffer: number = 0.06;      // Valeur de buffer initiale
       progress: number = 0;       // Valeur de progression initiale
       selectedPaymentMethod: string = ''; // Mode de paiement sélectionné
       phoneNumber: string = ''; // Numéro de téléphone saisi
       phoneNumberError: string = ''; // Message d'erreur pour le numéro
       phoneNumberValid: boolean = false; // Validation du numéro

       constructor (

              private router: Router,
              private planService: PlanService,
              private apiService: ApiService,
              private toastController: ToastController,
              private alertController: AlertController,
              private countdownService: CountdownService,
              private notificationService: NotificationService,

       ) { } // Injecte ToastController et AlertController


       ngOnInit()
       {
              // Utiliser setTimeout pour s'assurer que les éléments sont chargés
              setTimeout(() => {
                     this.initializePlanSelection();
              }, 100);
       }

       initializePlanSelection()
       {
              const planOptions: NodeListOf<HTMLElement> = document.querySelectorAll( '.plan-option' );
              console.log('Plan options found:', planOptions.length);
              
              if ( planOptions.length > 0 )
              {
                     // Supprimer toutes les classes active existantes
                     planOptions.forEach(option => option.classList.remove('active'));
                     
                     const activeIndex = localStorage.getItem( 'activePlanIndex' );
                     const indexToActivate = activeIndex !== null ? parseInt( activeIndex ) : 3; // Premium par défaut

                     if ( indexToActivate >= 0 && indexToActivate < planOptions.length )
                     {
                            planOptions[ indexToActivate ].classList.add( 'active' );
                            this.updatePlanInfo( planOptions[ indexToActivate ] );
                            console.log('Activated plan at index:', indexToActivate);
                     } else
                     {
                            planOptions[ 3 ].classList.add( 'active' ); // Premium par défaut
                            this.updatePlanInfo( planOptions[ 3 ] );
                            console.log('Activated default plan (Premium)');
                     }

                     // Ajouter les événements de clic
                     planOptions.forEach( ( planOption: HTMLElement, index: number ) =>
                     {
                            planOption.addEventListener( 'click', () =>
                            {
                                   console.log('Plan clicked:', index, planOption.classList);
                                   planOptions.forEach( ( option: HTMLElement ) => option.classList.remove( 'active' ) );
                                   planOption.classList.add( 'active' );
                                   localStorage.setItem( 'activePlanIndex', index.toString() );
                                   this.updatePlanInfo( planOption );
                                   console.log('Plan activated:', index);
                            } );
                     } );
              }
       }

       countries = [
              { name: 'France', flag: 'assets/flags/france.png' },
              { name: 'USA', flag: 'assets/flags/usa.png' },
              { name: 'Canada', flag: 'assets/flags/canada.png' },
       ];

       onCountryChange( event: any )
       {
              console.log( 'Pays sélectionné : ', event.detail.value );
       }














       onStartClick()
       {
              this.countdownService.startCountdown(); // Appeler la méthode du service
       }

       async nextPage()
       {
              // Validation pour l'étape 2 (choix du mode de paiement)
              if (this.page === 2 && !this.selectedPaymentMethod) {
                     this.presentErrorToast('Veuillez sélectionner un mode de paiement avant de continuer');
                     this.highlightPaymentCards();
                     return;
              }

              if ( this.page < 3 )
              {
                     this.page += 1;
              } else
              {
                     // Vérifications finales avant le paiement
                     if (!this.selectedPaymentMethod) {
                            this.presentErrorToast('Veuillez sélectionner un mode de paiement');
                            return;
                     }

                     if (!this.phoneNumberValid) {
                            this.presentErrorToast('Veuillez entrer un numéro de téléphone valide');
                            return;
                     }

                     // Afficher le popup d'information avant de procéder
                     await this.showProcessingAlert();
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
                                          <div style="font-size: 1.25rem; font-weight: 800; color: #dc2626;">${this.getCurrentPlanPrice()}€<span style="font-size: 0.8rem; color: #64748b;">/mois</span></div>
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
              const activePlanElement = document.querySelector( '.plan-option.active' );
              const planName = activePlanElement?.getAttribute( 'data-plan' ) || '';
              const planPrice = activePlanElement?.getAttribute( 'data-prix' ) || '';

              // Mettre à jour le service avec le plan sélectionné
              this.planService.updateSelectedPlan( planName, planPrice );

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
              this.notificationService.addNotification( notification );
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
                     'Essentiel': '720p HD',
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


       showLoadingAndNavigate()
       {
              this.isLoading = true; // Affiche la barre de progression
              this.buffer = 0.06;    // Réinitialise la valeur de buffer
              this.progress = 0;     // Réinitialise la valeur de progression

              const interval = setInterval( () =>
              {
                     this.buffer += 0.06;
                     this.progress += 0.06;

                     if ( this.progress > 1 )
                     {
                            clearInterval( interval ); // Arrête l'intervalle

                            setTimeout( () =>
                            {
                                   this.isLoading = false; // Cache la barre de progression
                                   this.router.navigate( [ '/tabs/tab1' ] ).then( () =>
                                   {
                                          this.resetPager(); // Réinitialise la page après la navigation
                                          this.presentToast(); // Affiche le toast de confirmation après la redirection
                                   } );
                            }, 1000 ); // Délai d'1 seconde avant la redirection
                     }
              }, 1000 ); // Mise à jour toutes les 1000ms (1 seconde)
       }

       startCountdownProcess()
       {
              this.countdownService.startCountdown(); // Appeler la méthode du service pour démarrer le compte à rebours
       }

       resetPager()
       {
              this.page = 1; // Réinitialise à la première page
       }

       async presentToast()
       {
              const toast = await this.toastController.create( {
                     message: 'Le paiement a bien été effectué.',
                     duration: 3500,  // Durée d'affichage en millisecondes
                     position: 'middle', // Position au centre de l'écran
                     cssClass: 'custom-toast', // Classe CSS personnalisée
              } );
              await toast.present();
       }

       // Méthode de navigation retour
       goBack(): void {
              window.history.back();
       }

       // Méthode pour sélectionner un mode de paiement (sélection exclusive)
       selectPaymentMethod(method: string): void {
              this.selectedPaymentMethod = method;
              this.phoneNumber = ''; // Reset du numéro lors du changement d'opérateur
              this.phoneNumberError = '';
              this.phoneNumberValid = false;
              console.log('Mode de paiement sélectionné:', method);
       }

       // Validation du numéro de téléphone selon l'opérateur
       validatePhoneNumber(): void {
              const number = this.phoneNumber.trim();
              
              if (!number) {
                     this.phoneNumberError = '';
                     this.phoneNumberValid = false;
                     return;
              }

              // Validation selon l'opérateur sélectionné
              if (this.selectedPaymentMethod === 'orange') {
                     this.validateOrangeNumber(number);
              } else if (this.selectedPaymentMethod === 'mtn') {
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
              return this.selectedPaymentMethod === 'orange' ? 'Orange Money' : 'MTN Money';
       }

       getOperatorLogo(): string {
              return this.selectedPaymentMethod === 'orange' ? '../../assets/R.png' : '../../assets/th (1).jpeg';
       }

       getPhonePlaceholder(): string {
              if (this.selectedPaymentMethod === 'orange') {
                     return 'Ex: 691234567 (Orange)';
              } else if (this.selectedPaymentMethod === 'mtn') {
                     return 'Ex: 651234567 (MTN)';
              }
              return 'Numéro de téléphone';
       }

       getCurrentPlanPrice(): string {
              const activePlanElement = document.querySelector('.plan-option.active');
              return activePlanElement?.getAttribute('data-prix') || '9.99';
       }

       // Méthode améliorée pour mettre à jour les informations du plan
       updatePlanInfo( planElement: HTMLElement ): void
       {
              const prix = planElement.getAttribute( 'data-prix' );
              const qualite = planElement.getAttribute( 'data-qualite' );
              const resolution = planElement.getAttribute( 'data-resolution' );
              const support = planElement.getAttribute( 'data-support' );
              const appareils = planElement.getAttribute( 'data-appareils' );
              const telechargement = planElement.getAttribute( 'data-telechargement' );

              // Mise à jour du prix avec formatage
              const priceElement = document.getElementById( 'info-div1' ) as HTMLElement;
              if (priceElement && prix) {
                     priceElement.textContent = `${prix}€`;
              }

              // Mise à jour de la qualité
              const qualityElement = document.getElementById( 'info-div2' ) as HTMLElement;
              if (qualityElement && qualite) {
                     qualityElement.textContent = qualite;
              }

              // Mise à jour de la résolution
              const resolutionElement = document.getElementById( 'info-div3' ) as HTMLElement;
              if (resolutionElement && resolution) {
                     resolutionElement.textContent = resolution;
              }

              // Mise à jour des appareils supportés
              const supportElement = document.getElementById( 'info-div4' ) as HTMLElement;
              if (supportElement && support) {
                     // Formatage plus lisible des appareils
                     const formattedSupport = support.replace('TV, computer, mobile phone, tablet', 'TV, ordinateur, smartphone, tablette')
                                                   .replace('Mobile phone, tablet', 'Smartphone, tablette');
                     supportElement.textContent = formattedSupport;
              }

              // Mise à jour du nombre d'appareils simultanés
              const appareilsElement = document.getElementById( 'info-div5' ) as HTMLElement;
              if (appareilsElement && appareils) {
                     appareilsElement.textContent = appareils;
              }

              // Mise à jour des téléchargements
              const telechargementElement = document.getElementById( 'info-div6' ) as HTMLElement;
              if (telechargementElement && telechargement) {
                     telechargementElement.textContent = telechargement;
              }
       }










       sendData()
       {
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
              this.apiService.postData( payload ).then(
                     ( response ) =>
                     {
                            console.log( 'Données envoyées avec succès:', response );
                     },
                     ( error ) =>
                     {
                            console.error( 'Erreur lors de l\'envoi des données:', error );
                     }
              );
       }


}
