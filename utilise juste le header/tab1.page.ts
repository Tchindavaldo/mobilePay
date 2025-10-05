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
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase-config';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  @ViewChild('flyingContainer', { static: false }) flyingContainer!: ElementRef;

  userName: string | null = null;
  userPhoto: string | null = null;
  selectedPlanName: string = 'Basic';
  selectedPlanPrice: string = '9.99';
  notificationCount: number = 0;
  isDialogVisible: boolean = false;
  selectedMood: string = 'neutral';

  // Emojis pour les différentes humeurs
  moodEmojis = {
    excellent: ['😍', '🥰', '😘', '🤩', '✨', '💖', '🌟'],
    happy: ['😊', '😄', '😃', '🙂', '😌', '🌈', '☀️'],
    neutral: ['😐', '😑', '🤔', '😶', '🙄', '💭', '⚖️'],
    sad: ['😢', '😭', '😞', '😔', '💧', '🌧️', '😿'],
    angry: ['😡', '😠', '🤬', '💢', '🔥', '⚡', '👿']
  };

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
    console.log('Tab1 ngOnInit called');
    this.loadUserData();
    this.loadNotificationCount();
    this.loadPlanData();
    this.loadSavedMood();

    // Subscribe to the public observable `days$` from the CountdownService
    this.countdownService.days$.subscribe((value: number) => {
      this.days = value; // Update the days value to be displayed
    });

    // S'abonner au service pour obtenir les mises à jour en temps réel
    this.planService.selectedPlan$.subscribe(({ plan, price }) => {
      this.selectedPlanName = plan;
      this.selectedPlanPrice = price;
    });

    // Debug: vérifier le nom utilisateur après un délai
    setTimeout(() => {
      console.log('Current userName after delay:', this.userName);
      console.log('getFirstName() returns:', this.getFirstName());
    }, 2000);
  }

  loadUserData() {
    const auth = getAuth(app);

    // D'abord, essayer de récupérer depuis localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserPhoto = localStorage.getItem('userPhoto');

    if (storedUserName) {
      console.log('Loading user data from localStorage:', storedUserName);
      console.log('Loading user photo from localStorage:', storedUserPhoto);
      this.userName = storedUserName;
      this.userPhoto = storedUserPhoto;
    }

    // Ensuite, écouter les changements d'état d'authentification
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User data loaded from Firebase:', user);

        // Récupérer le nom complet ou l'email
        let fullName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';

        console.log('Full name from Firebase:', fullName);
        this.userName = fullName;
        this.userPhoto = user.photoURL;

        // Sauvegarder dans localStorage pour la prochaine fois
        localStorage.setItem('userName', fullName);
        if (user.photoURL) {
          localStorage.setItem('userPhoto', user.photoURL);
        }

        console.log('UserName set to:', this.userName);
      } else {
        console.log('No user found in Firebase');
        // Ne pas effacer les données si elles existent déjà
        if (!this.userName) {
          this.userName = 'Utilisateur';
          this.userPhoto = null;
        }
      }
    });
  }

  loadNotificationCount() {
    // Simuler le nombre de notifications
    this.notificationCount = 3;
  }

  loadPlanData() {
    // Charger les données du plan depuis le service
    const currentPlan = this.planService.getCurrentPlan();
    if (currentPlan) {
      this.selectedPlanName = currentPlan.plan;
      this.selectedPlanPrice = currentPlan.price;
    }
  }

  getProgressPercentage(): number {
    const maxDays = 30; // Supposons un abonnement de 30 jours
    return Math.max(0, Math.min(100, (this.days / maxDays) * 100));
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
    if (hour < 12) {
      return 'Bonne matinée ! ☀️';
    } else if (hour < 18) {
      return 'Bon après-midi ! 🌤️';
    } else {
      return 'Bonne soirée ! 🌙';
    }
  }

  getUserPhoto(): string {
    // Si pas de photo, essayer de recharger depuis localStorage
    if (!this.userPhoto) {
      const storedPhoto = localStorage.getItem('userPhoto');
      if (storedPhoto) {
        this.userPhoto = storedPhoto;
        console.log('Photo loaded from localStorage:', storedPhoto);
      }
    }

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

  // Sélectionner une humeur et déclencher l'animation
  selectMood(mood: string, emoji: string) {
    console.log('Mood selected:', mood);
    this.selectedMood = mood;

    // Sauvegarder l'humeur dans localStorage
    localStorage.setItem('selectedMood', mood);

    // Déclencher l'animation d'emojis volants
    this.createFlyingEmojis(emoji, mood);

    // Ajouter une notification
    const notification: Notification = {
      title: 'Humeur mise à jour',
      message: `Vous vous sentez ${this.getMoodLabel(mood)} aujourd'hui !`,
      image: '../../assets/LOGO.jpg',
      time: new Date(),
    };
    this.notificationService.addNotification(notification);
  }

  // Créer les emojis volants
  createFlyingEmojis(mainEmoji: string, mood: string) {
    if (!this.flyingContainer) return;

    const container = this.flyingContainer.nativeElement;
    const emojisToUse = this.moodEmojis[mood as keyof typeof this.moodEmojis] || [mainEmoji];

    // Créer 8-12 emojis volants
    const numberOfEmojis = Math.floor(Math.random() * 5) + 8;

    for (let i = 0; i < numberOfEmojis; i++) {
      setTimeout(() => {
        this.createSingleFlyingEmoji(container, emojisToUse);
      }, i * 100); // Délai entre chaque emoji
    }
  }

  // Créer un emoji volant individuel
  createSingleFlyingEmoji(container: HTMLElement, emojis: string[]) {
    const emoji = document.createElement('div');
    emoji.className = 'flying-emoji fly-animation';
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // Position de départ (centre de l'écran approximativement)
    const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
    const startY = window.innerHeight / 2;

    // Position finale (aléatoire)
    const endX = Math.random() * window.innerWidth;
    const endY = Math.random() * window.innerHeight * 0.3; // Vers le haut

    emoji.style.left = startX + 'px';
    emoji.style.top = startY + 'px';

    // Ajouter l'emoji au container
    container.appendChild(emoji);

    // Animation personnalisée
    emoji.animate([
      {
        transform: `translate(0, 0) scale(1) rotate(0deg)`,
        opacity: 1
      },
      {
        transform: `translate(${(endX - startX) * 0.3}px, ${(endY - startY) * 0.3}px) scale(1.2) rotate(90deg)`,
        opacity: 0.8
      },
      {
        transform: `translate(${(endX - startX) * 0.6}px, ${(endY - startY) * 0.6}px) scale(1.1) rotate(180deg)`,
        opacity: 0.6
      },
      {
        transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.5) rotate(360deg)`,
        opacity: 0
      }
    ], {
      duration: 2000 + Math.random() * 1000, // 2-3 secondes
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    // Supprimer l'emoji après l'animation
    setTimeout(() => {
      if (emoji.parentNode) {
        emoji.parentNode.removeChild(emoji);
      }
    }, 3500);
  }

  // Obtenir le label de l'humeur
  getMoodLabel(mood: string): string {
    const labels: { [key: string]: string } = {
      excellent: 'excellent',
      happy: 'content',
      neutral: 'neutre',
      sad: 'triste',
      angry: 'énervé'
    };
    return labels[mood] || 'neutre';
  }

  // Charger l'humeur sauvegardée
  loadSavedMood() {
    const savedMood = localStorage.getItem('selectedMood');
    if (savedMood) {
      this.selectedMood = savedMood;
    }
  }



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
