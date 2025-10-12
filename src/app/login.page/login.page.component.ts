import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../notification.service';
import { UserService } from '../user.service';
import { GoogleAuthService } from '../services/google-auth.service';

@Component({
  selector: 'app-login.page',
  templateUrl: './login.page.component.html',
  styleUrls: ['./login.page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  showEmailForm = false;
  showRegisterForm = false;

  user = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };

  constructor(
    private alertController: AlertController,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private googleAuthService: GoogleAuthService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  showEmailLogin() {
    this.showEmailForm = true;
    this.showRegisterForm = false;
  }

  showRegister() {
    this.showRegisterForm = true;
    this.showEmailForm = false;
  }

  showLogin() {
    this.showEmailForm = true;
    this.showRegisterForm = false;
  }

  backToMainLogin() {
    this.showEmailForm = false;
    this.showRegisterForm = false;
  }

  showPhoneAuth() {
    this.router.navigate(['/phone-auth']);
  }

  async loginUser() {
    if (this.user.email && this.user.password) {
      const auth = getAuth(app);

      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.user.email, this.user.password);

        const alert = await this.alertController.create({
          header: 'Connexion Réussie',
          message: 'Bienvenue !',
          buttons: ['OK']
        });

        await alert.present();
        this.router.navigate(['/tabs/tab1']);

        const notification: Notification = {
          title: 'Connexion',
          message: 'Vous êtes maintenant connecté.',
          image: '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

      } catch (error: any) {
        const alert = await this.alertController.create({
          header: 'Erreur de connexion',
          message: error.message || 'Email ou mot de passe incorrect.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Veuillez remplir tous les champs.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async registerUser() {
    if (this.user.name && this.user.email && this.user.password && this.user.phone) {
      const auth = getAuth(app);
      
      try {
        // Créer un nouvel utilisateur
        const userCredential = await createUserWithEmailAndPassword(auth, this.user.email, this.user.password);
        
        // this.userService.setUserName(this.user.name); 

        // Afficher une alerte de succès 
        const alert = await this.alertController.create({
          header: 'Inscription Réussie',
          message: `Bienvenue, ${this.user.name}!`,
          buttons: ['OK']
        });

        await alert.present();

        this.router.navigate(['/tabs/tab1']);

        const notification: Notification = {
          title: 'Compte',
          message: 'Votre compte a été créé avec succès.',
          image: '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);
      } catch (error: any) { // Typage de l'erreur
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: error.message || 'Une erreur est survenue.', // Utiliser une valeur par défaut
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Veuillez remplir tous les champs.',
        buttons: ['OK']
      });

      await alert.present();
    }
  }

  async signInWithGoogle() {
    const loading = await this.loadingController.create({
      message: '🔐 Connexion avec Google...',
      spinner: 'crescent',
      backdropDismiss: false // Empêcher de fermer le loader en cliquant à côté
    });
    await loading.present();

    try {
      // Étape 1 : Authentification Firebase/Google
      console.log('🔐 Début de l\'authentification Google...');
      
      const user = await this.googleAuthService.signInWithGoogle();
      // Note : signInWithGoogle() attend déjà la fin de toutes les opérations :
      // - Firebase Auth
      // - Backend GET/POST
      // - Storage local
      // - UserDataService

      if (user) {
        // Tout est terminé avec succès !
        console.log('✓ Connexion complète réussie !');
        
        // Mettre à jour le message du loader avant de rediriger
        loading.message = '✓ Connexion réussie ! Redirection...';
        
        // Ajouter une notification
        const notification: Notification = {
          title: 'Connexion Google',
          message: `Bienvenue ${user.displayName || user.email} !`,
          image: user.photoURL || '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        // Petite pause pour montrer le message de succès
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dismiss le loader
        await loading.dismiss();
        
        // Rediriger vers l'application
        console.log('Redirection vers /tabs/tab1...');
        const navigationSuccess = await this.router.navigate(['/tabs/tab1']);
        
        if (!navigationSuccess) {
          console.error('Navigation failed, trying alternative route');
          window.location.href = '/tabs/tab1';
        }

        // Afficher l'alerte de bienvenue après la redirection
        setTimeout(async () => {
          const alert = await this.alertController.create({
            header: '🎉 Connexion réussie',
            message: `Bienvenue ${user.displayName || user.email} !`,
            buttons: ['OK']
          });
          await alert.present();
        }, 500);
      } else {
        // Aucun utilisateur retourné (ne devrait pas arriver)
        await loading.dismiss();
        
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de récupérer les informations utilisateur.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error: any) {
      // Une erreur s'est produite (Firebase, Backend, ou autre)
      console.error('❌ Erreur lors de la connexion:', error);
      
      await loading.dismiss();

      const alert = await this.alertController.create({
        header: '❌ Erreur de connexion',
        message: error.message || 'Impossible de se connecter avec Google. Vérifiez votre connexion et réessayez.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async registerWithGoogle() {
    // Pour l'inscription, on utilise la même méthode que la connexion
    // car Google gère automatiquement la création de compte
    await this.signInWithGoogle();
  }
}
