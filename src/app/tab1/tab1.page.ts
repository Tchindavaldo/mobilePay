import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronDownCircle,
  chevronForwardCircle,
  chevronUpCircle,
  document as ionDocument,
  globe,
} from 'ionicons/icons';
import { CountdownService } from '../countdown.service';
import { PlanService } from '../plan.service';
import { NotificationService, Notification } from '../notification.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userName: string | null = null;
  selectedPlanName: string = 'aucun';
  selectedPlanPrice: string = '0';

  constructor(
    private alertController: AlertController,
    private toastController: ToastController, private userService: UserService, // Ajout du ToastController
    private countdownService: CountdownService,
    private planService: PlanService,
    private notificationService: NotificationService
  ) {
    addIcons({ chevronDownCircle, chevronForwardCircle, chevronUpCircle, ionDocument, globe });
    
  }

  public alertButtons = [
    {
      text: 'Non',
      cssClass: 'alert-button-cancel',
    },
    {
      text: 'oui',
      cssClass: 'alert-button-confirm',
      
    },
  ];

  ngOnInit() {
    const sticks: NodeListOf<HTMLElement> = document.querySelectorAll('.stick');

    // Vérifiez s'il y a des sticks et définissez le premier comme actif par défaut
    if (sticks.length > 0) {
      // Récupérer l'index de la dernière div active depuis localStorage
      const activeIndex = localStorage.getItem('activeStickIndex');

      if (activeIndex !== null) {
        // Appliquez la classe active à la div correspondante
        sticks[parseInt(activeIndex)].classList.add('active');
      } else {
        // Si aucun index n'est trouvé, activez la première div
        sticks[0].classList.add('active');
      }
     
    }

    // Ajouter un écouteur d'événements à chaque div 'stick'
    sticks.forEach((stick: HTMLElement, index: number) => {
      stick.addEventListener('click', () => {
        // Retirer la classe 'active' de tous les sticks
        sticks.forEach((s: HTMLElement) => s.classList.remove('active'));

        // Ajouter la classe 'active' à la div cliquée
        stick.classList.add('active');

        // Enregistrer l'index de la div active dans localStorage
        localStorage.setItem('activeStickIndex', index.toString());
      });
    });

    // this.userName = this.userService.getUserName();

    // Subscribe to the public observable `days$` from the CountdownService
    this.countdownService.days$.subscribe((value: number) => {
      this.days = value; // Update the days value to be displayed
    });


    // S'abonner au service pour obtenir les mises à jour en temps réel
    this.planService.selectedPlan$.subscribe(({ plan, price }) => {
      this.selectedPlanName = plan;
      this.selectedPlanPrice = price;
    });
  }

  

  isDialogVisible: boolean = false; // Pour contrôler l'affichage de la boîte de dialogue



  // Afficher la boîte de dialogue
  showDialog() {
    this.isDialogVisible = true;
  }

  // Fermer la boîte de dialogue
  closeDialog() {
    this.isDialogVisible = false;
  }

  // Confirmer le désabonnement
  confirmUnsubscribe() {
    // Logique pour désabonner l'utilisateur
    console.log('Utilisateur désabonné avec succès.');
    this.closeDialog(); // Fermer la boîte de dialogue après la confirmation
    this.presentSuccessToast(); // Afficher la notification de succès
  }

  // Fonction pour afficher la notification Toast
  async presentSuccessToast() {
    const toast = await this.toastController.create({
      message: 'Vous avez été désabonné avec succès.',
      duration: 3000,
      position: 'middle',
      cssClass: 'custom-toast',  // Classe CSS personnalisée
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });
  
    await toast.present();
  }


  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'cette fonction nest pas encore disponible contacter le cervice client pour plus dínformation.',
      duration: 3000,
      position: 'middle',
      cssClass: 'custom-toast',  // Classe CSS personnalisée
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });
  
    await toast.present();
  }
  
  numbers: number[] = [1, 2, 3, 4];
  resetNumbers(){
    this.numbers= this.numbers.map(()=> 0);
  }
  




  onUnsubscribe() {
    // Réinitialiser le plan et le prix
    this.planService.resetPlan();
  }
  onStopCountdown() {
    this.countdownService.stopCountdown(); // Appeler la méthode pour arrêter et réinitialiser le compte à rebours
    console.log('Compte à rebours arrêté et réinitialisé à 0');

    const notification: Notification = {
      title: 'Desabonner',
      message: 'Le desabonnement a bien ete efectuer.',
      image: '../../assets/LOGO.jpg',
      time: new Date(),
    };
    this.notificationService.addNotification(notification);
  }





  days: number = 0; // L'état initial est 0
  
}
