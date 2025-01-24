import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Import du ToastController
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

       constructor (

              private router: Router,
              private planService: PlanService,
              private apiService: ApiService,
              private toastController: ToastController,
              private countdownService: CountdownService,
              private notificationService: NotificationService,

       ) { } // Injecte ToastController


       ngOnInit()
       {
              const parks: NodeListOf<HTMLElement> = document.querySelectorAll( '.park' );
              if ( parks.length > 0 )
              {
                     const activeIndex = localStorage.getItem( 'activeparkIndex' );
                     const indexToActivate = activeIndex !== null ? parseInt( activeIndex ) : 0;

                     if ( indexToActivate >= 0 && indexToActivate < parks.length )
                     {
                            parks[ indexToActivate ].classList.add( 'active' );
                            this.updatePlanInfo( parks[ indexToActivate ] ); // Met à jour les infos avec le plan actif
                     } else
                     {
                            parks[ 0 ].classList.add( 'active' ); // Définit la première div comme active par défaut
                            this.updatePlanInfo( parks[ 0 ] ); // Met à jour les infos avec le premier plan par défaut
                     }
              }

              parks.forEach( ( park: HTMLElement, index: number ) =>
              {
                     park.addEventListener( 'click', () =>
                     {
                            parks.forEach( ( s: HTMLElement ) => s.classList.remove( 'active' ) );
                            park.classList.add( 'active' );
                            localStorage.setItem( 'activeparkIndex', index.toString() );
                            this.updatePlanInfo( park ); // Update the info divs when a park is clicked
                     } );
              } );
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

       nextPage()
       {
              if ( this.page < 3 )
              {
                     this.page += 1;
              } else
              {
                     const activePlanElement = document.querySelector( '.park.active' );
                     const planName = activePlanElement?.getAttribute( 'data-plan' ) || '';
                     const planPrice = activePlanElement?.getAttribute( 'data-prix' ) || '';

                     // Mettre à jour le service avec le plan sélectionné
                     this.planService.updateSelectedPlan( planName, planPrice );

                     this.showLoadingAndNavigate();
                     this.startCountdownProcess();
                     // Émettre une notification
                     const notification: Notification = {
                            title: 'Abonnement',
                            message: 'Votre abonnement a ete active avec succes.',
                            image: '../../assets/LOGO.jpg',
                            time: new Date(),
                     };
                     this.sendData()
                     this.notificationService.addNotification( notification );
              }
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

       // Method to update plan info when a park is clicked
       updatePlanInfo( park: HTMLElement ): void
       {
              const prix = park.getAttribute( 'data-prix' );
              const qualite = park.getAttribute( 'data-qualite' );
              const resolution = park.getAttribute( 'data-resolution' );
              const support = park.getAttribute( 'data-support' );
              const appareils = park.getAttribute( 'data-appareils' );
              const telechargement = park.getAttribute( 'data-telechargement' );

              // Update the info divs
              ( document.getElementById( 'info-div1' ) as HTMLElement ).textContent = prix ?? '';
              ( document.getElementById( 'info-div2' ) as HTMLElement ).textContent = qualite ?? '';
              ( document.getElementById( 'info-div3' ) as HTMLElement ).textContent = resolution ?? '';
              ( document.getElementById( 'info-div4' ) as HTMLElement ).textContent = support ?? '';
              ( document.getElementById( 'info-div5' ) as HTMLElement ).textContent = appareils ?? '';
              ( document.getElementById( 'info-div6' ) as HTMLElement ).textContent = telechargement ?? '';
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
