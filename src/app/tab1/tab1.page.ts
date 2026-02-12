import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { UserStorageService } from '../services/storage/user-storage.service';
import { UserDataService } from '../services/user/data/user-data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userName: string | null = null;
  userPhoto: string | null = null;
  selectedPlanName: string = 'Basic';
  selectedPlanPrice: string = '9.99';
  notificationCount: number = 0;
  isDialogVisible: boolean = false;
  selectedFilter: string = 'all';
  userBalance: number = 0;
  showTooltip: boolean = false;
  currentSlide: number = 0;
  totalSlides: number = 3;
  autoSlideInterval: any;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private userService: UserService,
    private countdownService: CountdownService,
    private planService: PlanService,
    private notificationService: NotificationService,
    private userStorage: UserStorageService,
    private userData: UserDataService,
    public langService: LanguageService
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
    // Charger les données utilisateur
    this.loadUserData();
    this.loadNotificationCount();
    this.startAutoSlide();

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



  // Afficher la boîte de dialogue
  showDialog() {
    this.isDialogVisible = true;
  }

  // Fermer la boîte de dialogue
  closeDialog() {
    this.isDialogVisible = false;
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
  resetNumbers() {
    this.numbers = this.numbers.map(() => 0);
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
      image: 'assets/icon/opp.png',
      time: new Date(),
    };
    this.notificationService.addNotification(notification);
  }





  days: number = 0; // L'état initial est 0

  async loadUserData() {
    try {
      // Récupérer l'utilisateur depuis notre UserStorageService centralisé
      const user = await this.userStorage.get('user');

      if (user) {
        console.log('✅ User chargé depuis UserStorageService:', user);

        // Récupérer le nom complet ou l'email
        this.userName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
        this.userPhoto = user.photoURL || null;

        console.log('👤 UserName affiché:', this.userName);
        console.log('📸 UserPhoto affichée:', this.userPhoto);
      } else {
        console.log('⚠️ Aucun utilisateur trouvé dans le storage');
        this.userName = 'Utilisateur';
        this.userPhoto = null;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données utilisateur:', error);
      this.userName = 'Utilisateur';
      this.userPhoto = null;
    }
  }

  loadNotificationCount() {
    // Simuler le nombre de notifications
    this.notificationCount = 3;
  }

  getProgressPercentage(): number {
    const maxDays = 30; // Durée totale de l'abonnement
    const daysUsed = maxDays - this.days; // Jours déjà utilisés
    const percentage = Math.max(0, Math.min(100, (daysUsed / maxDays) * 100));
    return percentage;
  }

  openProfileMenu() {
    // Ouvrir le menu de profil ou naviguer vers la page de profil
    console.log('Opening profile menu');
  }

  getFirstName(): string {
    // Si pas de nom utilisateur, essayer de recharger depuis localStorage
    if (!this.userName || this.userName === 'Utilisateur') {
      const storedName = localStorage.getItem('userName');
      if (storedName && storedName !== 'Utilisateur') {
        this.userName = storedName;
      }
    }

    if (this.userName && this.userName !== 'Utilisateur') {
      // Si le nom est long, prendre seulement le premier mot
      const firstName = this.userName.split(' ')[0];

      // Si le prénom est trop long (plus de 12 caractères), le couper
      if (firstName.length > 12) {
        return firstName.substring(0, 12) + '...';
      }

      return firstName;
    }
    return 'Utilisateur';
  }

  getTimeGreeting(): string {
    const hour = new Date().getHours();
    const lang = this.langService.getCurrentLanguage();
    if (lang === 'en') {
      if (hour < 12) return 'Good morning! ☀️';
      else if (hour < 18) return 'Good afternoon! 🌤️';
      else return 'Good evening! 🌙';
    } else if (lang === 'es') {
      if (hour < 12) return '¡Buenos días! ☀️';
      else if (hour < 18) return '¡Buenas tardes! 🌤️';
      else return '¡Buenas noches! 🌙';
    }
    if (hour < 12) return 'Bonne matinée ! ☀️';
    else if (hour < 18) return 'Bon après-midi ! 🌤️';
    else return 'Bonne soirée ! 🌙';
  }

  t(key: string): string {
    return this.langService.translate(key);
  }

  getUserPhoto(): string {
    // Retourner la photo de l'utilisateur ou l'image par défaut
    return this.userPhoto || 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  onImageError(event: any) {
    console.log('Image failed to load, using fallback');
    event.target.src = 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  // Méthode de debug pour vérifier les données utilisateur
  debugUserData() {
    console.log('=== DEBUG USER DATA ===');
    console.log('userName:', this.userName);
    console.log('userPhoto:', this.userPhoto);
    console.log('localStorage userName:', localStorage.getItem('userName'));
    console.log('localStorage userPhoto:', localStorage.getItem('userPhoto'));
    console.log('getFirstName():', this.getFirstName());
    console.log('getUserPhoto():', this.getUserPhoto());
    console.log('======================');
  }

  // Confirmer le désabonnement
  confirmUnsubscribe() {
    this.onStopCountdown();
    this.onUnsubscribe();
    this.closeDialog();
    this.presentSuccessToast();
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

  // Méthode pour gérer la sélection des filtres
  selectFilter(filter: string) {
    this.selectedFilter = filter;
    console.log('Filter selected:', filter);

    // Ici tu peux ajouter la logique pour filtrer le contenu
    // Par exemple, filtrer les services selon la catégorie sélectionnée
    switch (filter) {
      case 'all':
        console.log('Afficher tous les services');
        break;
      case 'streaming':
        console.log('Afficher les services de streaming');
        break;
      case 'music':
        console.log('Afficher les services de musique');
        break;
      case 'gaming':
        console.log('Afficher les services de gaming');
        break;
      case 'productivity':
        console.log('Afficher les services de productivité');
        break;
    }
  }

  // Méthode pour basculer l'affichage du tooltip
  toggleTooltip() {
    this.showTooltip = !this.showTooltip;

    // Fermer automatiquement après 3 secondes
    if (this.showTooltip) {
      setTimeout(() => {
        this.showTooltip = false;
      }, 3000);
    }
  }

  // Méthodes pour gérer le slider
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    // Redémarrer l'auto-slide
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
}
